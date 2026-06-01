import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Camera, 
  Users, 
  GraduationCap, 
  Award,
  MapPin,
  Search,
  Filter,
  X,
  ZoomIn,
  Image as ImageIcon,
  Building,
  BookOpen,
  Sparkles
} from "lucide-react";

export const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const galleryCategories = [
    { name: "All", icon: ImageIcon },
    { name: "Graduations", icon: GraduationCap },
    { name: "Training Sessions", icon: BookOpen },
    { name: "Events", icon: Sparkles },
    { name: "Facilities", icon: Building },
    { name: "Students", icon: Users }
  ];

  const galleryImages = [
    {
      id: 1,
      category: "Training Sessions",
      title: "Training Session 1",
      description: "",
      image: "/Construction Health and Safety RPL learners/WhatsApp Image 2025-10-20 at 22.46.34.jpeg",
      date: "October 2025",
      location: "RevoQuest Training Center"
    },
    {
      id: 2,
      category: "Training Sessions",
      title: "Group Session",
      description: "",
      image: "/Construction Health and Safety RPL learners/WhatsApp Image 2025-10-20 at 22.46.34 (1).jpeg",
      date: "October 2025",
      location: "RevoQuest Training Center"
    },
    {
      id: 3,
      category: "Training Sessions",
      title: "Final Session",
      description: "",
      image: "/Construction Health and Safety RPL learners/WhatsApp Image 2025-10-20 at 22.46.35.jpeg",
      date: "October 2025",
      location: "RevoQuest Training Center"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Trained Students", icon: Users },
    { number: "75+", label: "Accredited Courses", icon: Award },
    { number: "15+", label: "Years Excellence", icon: Award },
    { number: "98%", label: "Success Rate", icon: GraduationCap }
  ];

  const filteredImages = selectedCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

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
              <Camera className="w-5 h-5 text-orange-600" />
              <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
                Our Visual Story
              </Badge>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              RevoQuest{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>

            {/* Enhanced Description */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/50 shadow-xl mb-8">
              <p className="text-2xl md:text-3xl mb-6 text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                Capturing Moments of{" "}
                <span className="font-bold text-orange-600 dark:text-orange-400">Excellence & Achievement</span>
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore our journey through images - from vibrant training sessions to proud graduation moments, modern facilities to inspiring success stories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden">
                <Card className="border-0 bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300 group-hover:scale-110">
                        <stat.icon className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-500 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Browse by Category</h2>
              <p className="text-slate-600 dark:text-slate-400">Filter images to explore specific areas of our institute</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {galleryCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="lg"
                    className={selectedCategory === category.name 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg" 
                      : "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20"}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-4 py-2">
                <Filter className="w-3 h-3 mr-2" />
                Showing {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Our address in Sandton Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Our Location
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our address in{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Sandton
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Visit our modern training facility located in the heart of Sandton, Johannesburg
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">165 West Street, Cnr Sandown Valley Crescent, Sandton</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our address in Sandton Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40.jpeg"
                      alt="Our address in Sandton 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40 (1).jpeg"
                      alt="Our address in Sandton 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40 (2).jpeg"
                      alt="Our address in Sandton 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41.jpeg"
                      alt="Our address in Sandton 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (1).jpeg"
                      alt="Our address in Sandton 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (2).jpeg"
                      alt="Our address in Sandton 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (3).jpeg"
                      alt="Our address in Sandton 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (4).jpeg"
                      alt="Our address in Sandton 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (5).jpeg"
                      alt="Our address in Sandton 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40.jpeg"
                      alt="Our address in Sandton 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40 (1).jpeg"
                      alt="Our address in Sandton 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.40 (2).jpeg"
                      alt="Our address in Sandton 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41.jpeg"
                      alt="Our address in Sandton 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (1).jpeg"
                      alt="Our address in Sandton 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (2).jpeg"
                      alt="Our address in Sandton 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (3).jpeg"
                      alt="Our address in Sandton 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (4).jpeg"
                      alt="Our address in Sandton 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our address in Sandton/WhatsApp Image 2025-10-20 at 22.56.41 (5).jpeg"
                      alt="Our address in Sandton 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Health and Safety RPL learners Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              RPL Training Program
            </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Construction Health and Safety{" "}
                    <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                      RPL learners
                    </span>
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
                    Recognition of Prior Learning (RPL) learners completing their Construction Health and Safety training program
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">RevoQuest Training Center</span>
                    </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Gallery Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredImages.map((item) => (
              <Card 
                key={item.id} 
                className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                onClick={() => handleImageClick(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                      <ZoomIn className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Day Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Heritage Day Celebration
                  </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our Learners participating in{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Heritage Day
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Celebrating South African heritage and cultural diversity with our learners during Heritage Day festivities
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Institute</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Day Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59.jpeg"
                      alt="Heritage Day 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                      <ZoomIn className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (1).jpeg"
                      alt="Heritage Day 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (3).jpeg"
                      alt="Heritage Day 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (4).jpeg"
                      alt="Heritage Day 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (5).jpeg"
                      alt="Heritage Day 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (6).jpeg"
                      alt="Heritage Day 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (7).jpeg"
                      alt="Heritage Day 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59.jpeg"
                      alt="Heritage Day 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (1).jpeg"
                      alt="Heritage Day 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (3).jpeg"
                      alt="Heritage Day 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (4).jpeg"
                      alt="Heritage Day 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (5).jpeg"
                      alt="Heritage Day 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (6).jpeg"
                      alt="Heritage Day 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Our Learners participating in Heritage Day/WhatsApp Image 2025-10-20 at 22.47.59 (7).jpeg"
                      alt="Heritage Day 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Small Business Consultants Class 2025 Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Business Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Small Business{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Consultants Class 2025
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Empowering entrepreneurs and business professionals with essential consulting skills and knowledge for small business success
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                    </div>
                    <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Institute</span>
                    </div>
                  </div>
          </div>
        </div>
      </section>

      {/* Small Business Consultants Class 2025 Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56.jpeg"
                      alt="Small Business Consultants 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
              </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (1).jpeg"
                      alt="Small Business Consultants 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (2).jpeg"
                      alt="Small Business Consultants 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (3).jpeg"
                      alt="Small Business Consultants 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57.jpeg"
                      alt="Small Business Consultants 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (1).jpeg"
                      alt="Small Business Consultants 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (2).jpeg"
                      alt="Small Business Consultants 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (3).jpeg"
                      alt="Small Business Consultants 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56.jpeg"
                      alt="Small Business Consultants 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (1).jpeg"
                      alt="Small Business Consultants 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (2).jpeg"
                      alt="Small Business Consultants 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.56 (3).jpeg"
                      alt="Small Business Consultants 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57.jpeg"
                      alt="Small Business Consultants 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (1).jpeg"
                      alt="Small Business Consultants 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (2).jpeg"
                      alt="Small Business Consultants 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Small Business Consultants Class 2025/WhatsApp Image 2025-10-20 at 22.50.57 (3).jpeg"
                      alt="Small Business Consultants 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Contracting RPL program lessons Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              RPL Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Construction Contracting{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                RPL program lessons
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Recognition of Prior Learning (RPL) learners completing their Construction Contracting training program
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Training Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Contracting RPL program lessons Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39.jpeg"
                      alt="Construction Contracting RPL 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (1).jpeg"
                      alt="Construction Contracting RPL 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (2).jpeg"
                      alt="Construction Contracting RPL 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (3).jpeg"
                      alt="Construction Contracting RPL 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39.jpeg"
                      alt="Construction Contracting RPL 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (1).jpeg"
                      alt="Construction Contracting RPL 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (2).jpeg"
                      alt="Construction Contracting RPL 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Contracting RPL program lessons/WhatsApp Image 2025-10-20 at 22.52.39 (3).jpeg"
                      alt="Construction Contracting RPL 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Underwriter and Claims Assessors RPL program Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              RPL Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Insurance Underwriter and Claims Assessors{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                RPL program
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Recognition of Prior Learning (RPL) learners completing their Insurance Underwriter and Claims Assessors training program
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                    </div>
                    <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Training Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Underwriter and Claims Assessors RPL program Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59.jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (1).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (2).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (3).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (4).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59.jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (1).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (2).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (3).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Insurance Underwriter and Claims Assessors RPL program/WhatsApp Image 2025-10-20 at 22.54.59 (4).jpeg"
                      alt="Insurance Underwriter and Claims Assessors RPL 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First Aid training sessions Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Safety Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              First Aid{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                training sessions
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Essential first aid training sessions providing life-saving skills and emergency response knowledge
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Training Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First Aid training sessions Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.24.jpeg"
                      alt="First Aid training 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.24 (1).jpeg"
                      alt="First Aid training 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25.jpeg"
                      alt="First Aid training 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (1).jpeg"
                      alt="First Aid training 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (2).jpeg"
                      alt="First Aid training 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (3).jpeg"
                      alt="First Aid training 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (4).jpeg"
                      alt="First Aid training 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (5).jpeg"
                      alt="First Aid training 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (6).jpeg"
                      alt="First Aid training 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.24.jpeg"
                      alt="First Aid training 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.24 (1).jpeg"
                      alt="First Aid training 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25.jpeg"
                      alt="First Aid training 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (1).jpeg"
                      alt="First Aid training 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (2).jpeg"
                      alt="First Aid training 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (3).jpeg"
                      alt="First Aid training 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (4).jpeg"
                      alt="First Aid training 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (5).jpeg"
                      alt="First Aid training 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/First Aid training sessions/WhatsApp Image 2025-10-20 at 22.58.25 (6).jpeg"
                      alt="First Aid training 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health and Safety Officers Class Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Professional Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Health and Safety{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Officers Class
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Professional development training for Health and Safety Officers, equipping them with essential skills for workplace safety management
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Training Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health and Safety Officers Class Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14.jpeg"
                      alt="Health and Safety Officers Class 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (1).jpeg"
                      alt="Health and Safety Officers Class 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (2).jpeg"
                      alt="Health and Safety Officers Class 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (3).jpeg"
                      alt="Health and Safety Officers Class 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (4).jpeg"
                      alt="Health and Safety Officers Class 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (5).jpeg"
                      alt="Health and Safety Officers Class 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (6).jpeg"
                      alt="Health and Safety Officers Class 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (7).jpeg"
                      alt="Health and Safety Officers Class 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15.jpeg"
                      alt="Health and Safety Officers Class 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (1).jpeg"
                      alt="Health and Safety Officers Class 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (2).jpeg"
                      alt="Health and Safety Officers Class 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (3).jpeg"
                      alt="Health and Safety Officers Class 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (4).jpeg"
                      alt="Health and Safety Officers Class 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14.jpeg"
                      alt="Health and Safety Officers Class 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (1).jpeg"
                      alt="Health and Safety Officers Class 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (2).jpeg"
                      alt="Health and Safety Officers Class 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (3).jpeg"
                      alt="Health and Safety Officers Class 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (4).jpeg"
                      alt="Health and Safety Officers Class 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (5).jpeg"
                      alt="Health and Safety Officers Class 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (6).jpeg"
                      alt="Health and Safety Officers Class 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.14 (7).jpeg"
                      alt="Health and Safety Officers Class 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15.jpeg"
                      alt="Health and Safety Officers Class 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (1).jpeg"
                      alt="Health and Safety Officers Class 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (2).jpeg"
                      alt="Health and Safety Officers Class 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (3).jpeg"
                      alt="Health and Safety Officers Class 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Health and Safety Officers Class/WhatsApp Image 2025-10-20 at 23.00.15 (4).jpeg"
                      alt="Health and Safety Officers Class 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EISA Exams in session Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Examination Session
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              EISA Exams{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                in session
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              EISA (Education and Training Sector Education and Training Authority) examination sessions conducted at our accredited assessment center
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">RevoQuest Assessment Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EISA Exams in session Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16.jpeg"
                      alt="EISA Exams in session 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16 (1).jpeg"
                      alt="EISA Exams in session 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16 (2).jpeg"
                      alt="EISA Exams in session 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16.jpeg"
                      alt="EISA Exams in session 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16 (1).jpeg"
                      alt="EISA Exams in session 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/EISA Exams in session/WhatsApp Image 2025-10-20 at 23.02.16 (2).jpeg"
                      alt="EISA Exams in session 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Practical training in Keiskamahoek - Eastern Cape Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Practical Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Construction Practical training in{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Keiskamahoek - Eastern Cape
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Hands-on construction practical training conducted in Keiskamahoek, Eastern Cape, providing real-world experience in construction techniques and safety protocols
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Keiskamahoek, Eastern Cape</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Practical training in Keiskamahoek - Eastern Cape Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19.jpeg"
                      alt="Construction Practical training in Keiskamahoek 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (1).jpeg"
                      alt="Construction Practical training in Keiskamahoek 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (2).jpeg"
                      alt="Construction Practical training in Keiskamahoek 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (3).jpeg"
                      alt="Construction Practical training in Keiskamahoek 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (4).jpeg"
                      alt="Construction Practical training in Keiskamahoek 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (5).jpeg"
                      alt="Construction Practical training in Keiskamahoek 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (6).jpeg"
                      alt="Construction Practical training in Keiskamahoek 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19.jpeg"
                      alt="Construction Practical training in Keiskamahoek 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (1).jpeg"
                      alt="Construction Practical training in Keiskamahoek 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (2).jpeg"
                      alt="Construction Practical training in Keiskamahoek 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (3).jpeg"
                      alt="Construction Practical training in Keiskamahoek 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (4).jpeg"
                      alt="Construction Practical training in Keiskamahoek 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (5).jpeg"
                      alt="Construction Practical training in Keiskamahoek 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical training in Keiskamahoek - Eastern Cape/WhatsApp Image 2025-10-20 at 23.03.19 (6).jpeg"
                      alt="Construction Practical training in Keiskamahoek 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Practical Training - Bloemfontein Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Practical Training Program
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Construction Practical Training -{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Bloemfontein
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Hands-on construction practical training conducted in Bloemfontein, Free State, providing comprehensive skills development in construction techniques and safety protocols
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Bloemfontein, Free State</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Practical Training - Bloemfontein Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.25.jpeg"
                      alt="Construction Practical Training Bloemfontein 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27.jpeg"
                      alt="Construction Practical Training Bloemfontein 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (1).jpeg"
                      alt="Construction Practical Training Bloemfontein 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (2).jpeg"
                      alt="Construction Practical Training Bloemfontein 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (3).jpeg"
                      alt="Construction Practical Training Bloemfontein 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (4).jpeg"
                      alt="Construction Practical Training Bloemfontein 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (5).jpeg"
                      alt="Construction Practical Training Bloemfontein 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (6).jpeg"
                      alt="Construction Practical Training Bloemfontein 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (7).jpeg"
                      alt="Construction Practical Training Bloemfontein 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (8).jpeg"
                      alt="Construction Practical Training Bloemfontein 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (9).jpeg"
                      alt="Construction Practical Training Bloemfontein 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (10).jpeg"
                      alt="Construction Practical Training Bloemfontein 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (11).jpeg"
                      alt="Construction Practical Training Bloemfontein 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (12).jpeg"
                      alt="Construction Practical Training Bloemfontein 14"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (13).jpeg"
                      alt="Construction Practical Training Bloemfontein 15"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.25.jpeg"
                      alt="Construction Practical Training Bloemfontein 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27.jpeg"
                      alt="Construction Practical Training Bloemfontein 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (1).jpeg"
                      alt="Construction Practical Training Bloemfontein 3"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (2).jpeg"
                      alt="Construction Practical Training Bloemfontein 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (3).jpeg"
                      alt="Construction Practical Training Bloemfontein 5"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (4).jpeg"
                      alt="Construction Practical Training Bloemfontein 6"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (5).jpeg"
                      alt="Construction Practical Training Bloemfontein 7"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (6).jpeg"
                      alt="Construction Practical Training Bloemfontein 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (7).jpeg"
                      alt="Construction Practical Training Bloemfontein 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (8).jpeg"
                      alt="Construction Practical Training Bloemfontein 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (9).jpeg"
                      alt="Construction Practical Training Bloemfontein 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (10).jpeg"
                      alt="Construction Practical Training Bloemfontein 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (11).jpeg"
                      alt="Construction Practical Training Bloemfontein 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (12).jpeg"
                      alt="Construction Practical Training Bloemfontein 14"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Construction Practical Training - Bloemfontein/WhatsApp Image 2025-10-20 at 23.05.27 (13).jpeg"
                      alt="Construction Practical Training Bloemfontein 15"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Construction Training graduates in Tembisa Section */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 px-6 py-2 text-sm font-medium shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Graduation Ceremony
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Technical Construction Training graduates in{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
                Tembisa
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl mx-auto">
              Celebrating the successful graduation of Technical Construction Training participants in Tembisa, showcasing their achievements and readiness for the construction industry
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Tembisa, Gauteng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Construction Training graduates in Tembisa Animated Gallery */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-8">
              {/* First set of images */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (14).jpeg"
                      alt="Technical Construction Training graduates Tembisa 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.31 (1).jpeg"
                      alt="Technical Construction Training graduates Tembisa 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.31 (2).jpeg"
                      alt="Technical Construction Training graduates Tembisa 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (2).jpeg"
                      alt="Technical Construction Training graduates Tembisa 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (3).jpeg"
                      alt="Technical Construction Training graduates Tembisa 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (4).jpeg"
                      alt="Technical Construction Training graduates Tembisa 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (5).jpeg"
                      alt="Technical Construction Training graduates Tembisa 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (6).jpeg"
                      alt="Technical Construction Training graduates Tembisa 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (7).jpeg"
                      alt="Technical Construction Training graduates Tembisa 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (8).jpeg"
                      alt="Technical Construction Training graduates Tembisa 14"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (9).jpeg"
                      alt="Technical Construction Training graduates Tembisa 15"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (10).jpeg"
                      alt="Technical Construction Training graduates Tembisa 16"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (11).jpeg"
                      alt="Technical Construction Training graduates Tembisa 17"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (12).jpeg"
                      alt="Technical Construction Training graduates Tembisa 18"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (13).jpeg"
                      alt="Technical Construction Training graduates Tembisa 19"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (15).jpeg"
                      alt="Technical Construction Training graduates Tembisa 21"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (16).jpeg"
                      alt="Technical Construction Training graduates Tembisa 22"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 flex-shrink-0">
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (14).jpeg"
                      alt="Technical Construction Training graduates Tembisa 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.31 (1).jpeg"
                      alt="Technical Construction Training graduates Tembisa 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.31 (2).jpeg"
                      alt="Technical Construction Training graduates Tembisa 4"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (2).jpeg"
                      alt="Technical Construction Training graduates Tembisa 8"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (3).jpeg"
                      alt="Technical Construction Training graduates Tembisa 9"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (4).jpeg"
                      alt="Technical Construction Training graduates Tembisa 10"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (5).jpeg"
                      alt="Technical Construction Training graduates Tembisa 11"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (6).jpeg"
                      alt="Technical Construction Training graduates Tembisa 12"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (7).jpeg"
                      alt="Technical Construction Training graduates Tembisa 13"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (8).jpeg"
                      alt="Technical Construction Training graduates Tembisa 14"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (9).jpeg"
                      alt="Technical Construction Training graduates Tembisa 15"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (10).jpeg"
                      alt="Technical Construction Training graduates Tembisa 16"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (11).jpeg"
                      alt="Technical Construction Training graduates Tembisa 17"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (12).jpeg"
                      alt="Technical Construction Training graduates Tembisa 18"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (13).jpeg"
                      alt="Technical Construction Training graduates Tembisa 19"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (15).jpeg"
                      alt="Technical Construction Training graduates Tembisa 21"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer w-80 h-80">
                  <div className="relative overflow-hidden h-full">
                    <img
                      src="/Technical Construction Training graduates in Tembisa/WhatsApp Image 2025-10-20 at 23.08.32 (16).jpeg"
                      alt="Technical Construction Training graduates Tembisa 22"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <ZoomIn className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 h-10 w-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
              >
                <X className="h-5 w-5" />
              </Button>
              
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain bg-slate-100 dark:bg-slate-900"
              />
              
              <div className="p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  {selectedImage.category}
                </Badge>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                  {selectedImage.title}
                </h2>
                {selectedImage.description && (
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {selectedImage.description}
                </p>
                )}
                <div className="flex flex-wrap gap-6 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedImage.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">{selectedImage.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
