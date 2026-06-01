import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  Users,
  Award
} from "lucide-react";

interface ContactPageProps {
  showHeader?: boolean;
  revoLearn?: boolean;
}

export const ContactPage = ({ showHeader = true, revoLearn }: ContactPageProps) => {
  const brand = revoLearn ? "Revo Learn" : "RevoQuest";
  const brandInstitute = revoLearn ? "Revo Learn" : "RevoQuest Institute";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }, 3000);
  };



  if (isSubmitted) {
    return (
      <div>
        {showHeader && <Header />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Message Sent Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (revoLearn) {
    return (
      <div>
        {showHeader && <Header />}
        <div id="contact" className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 py-14 sm:py-20 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-300 mb-5">
                <MessageCircle className="w-4 h-4" />
                Contact Revo Learn
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Need help choosing a course?
              </h1>
              <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                Send us a message and our team will help you with course options, payments, and getting started.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <Card className="border-slate-800 bg-slate-900/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Phone className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium">+27 10 595 3692</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Mail className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium">info@revoquest.co.za</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium">Mon - Fri: 8:00 - 16:30</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Send us a message</CardTitle>
                <p className="text-slate-400">We usually reply within 24 hours.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-slate-300">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-300">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-300">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-300">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-300">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 font-semibold"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showHeader && <Header />}
      <div id="contact" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>

      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center max-w-5xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
            <MessageCircle className="w-5 h-5 text-orange-600" />
            <Badge className="border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 font-medium">
              Contact Us
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            Get in Touch with{" "}
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
              {brand}
            </span>
          </h1>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/50 shadow-lg mb-8">
            <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Ready to transform your career? Contact our expert team for personalized guidance on RPL programs, course selection, and career advancement opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-full">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-orange-800 dark:text-orange-300 font-medium">Expert Consultation</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-full">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-300 font-medium">Certified Programs</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-green-800 dark:text-green-300 font-medium">Quick Response</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Form */}
          <div id="contact-form">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Send us a Message
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Map Section */}
        <div className="mt-20">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <MapPin className="w-7 h-7" />
                Find Us
              </CardTitle>
              <p className="text-orange-100">
                Visit our office in Sandton for in-person consultations and course registrations.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Map Container */}
                <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.1234567890!2d28.0473!3d-26.1076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9572c2c2c2c2c2%3A0x2c2c2c2c2c2c2c2c!2s165%20West%20Street%2C%20Sandton%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-l-lg"
                    title={`${brandInstitute} Location`}
                  />

                  {/* Map Overlay Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-slate-800 dark:text-white">Office Location</span>
                    </div>
                  </div>

                  {/* Open in Google Maps Button */}
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                      onClick={() => window.open('https://maps.google.com/maps?q=165+West+Street,+Sandton,+South+Africa', '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-8 bg-white dark:bg-slate-800">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {brandInstitute}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Main Campus & Administrative Office
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Address</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            165 West Street<br />
                            Corner Sandown Valley Crescent<br />
                            Sandton, 2196<br />
                            South Africa
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Phone</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            +27 10 595 3692
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">WhatsApp</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            +27 69 683 1929
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            info@revoquest.co.za
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Business Hours</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            Monday - Friday: 8:00 AM - 4:30 PM<br />
                            Saturday: 9:00 AM - 1:00 PM<br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                        onClick={() => window.open('https://maps.google.com/maps?q=165+West+Street,+Sandton,+South+Africa', '_blank')}
                      >
                        <MapPin className="w-5 h-5 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};
