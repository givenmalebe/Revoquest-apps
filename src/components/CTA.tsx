import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, MessageCircle, Phone } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 hero-gradient"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <Badge variant="secondary" className="border-primary/20 bg-primary/5 text-primary">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ready to Transform Your Career?
            </Badge>
            
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Start with a best course and get{" "}
              <span className="gradient-text">bright future job</span>
            </h2>
            
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              World class learning for anyone, anywhere for Increasing Knowledge. Let your creativity shine and start brighting your future today and impress your audiences.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-8 py-8">
            {[
              "Recognition of Prior Learning (RPL)",
              "Accredited qualifications", 
              "Expert industry instructors",
              "Flexible learning options"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow group">
              Explore Courses
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
              <Phone className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </div>
          
          {/* Contact info */}
          <div className="pt-8">
            <p className="text-sm text-foreground/60 mb-4">Get in touch with us today</p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>0105953692</span>
              </div>
              <div className="text-muted-foreground">|</div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-primary font-medium">info@revoquest.co.za</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};