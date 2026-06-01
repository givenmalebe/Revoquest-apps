import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Apple, Play, Star, ArrowRight } from "lucide-react";
import mobileAppImage from "@/assets/mobile-app-mockup.jpg";

export const MobileShowcase = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-accent/10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <Badge variant="outline" className="glass-morphism">
              <Download className="w-4 h-4 mr-2" />
              Mobile App Available
            </Badge>
            
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Inspect anywhere with our{" "}
                <span className="gradient-text">mobile app</span>
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Take your inspections offline with our powerful mobile application. Scan, record, and sync data seamlessly between field work and office management.
              </p>
            </div>
            
            {/* App Features List */}
            <div className="space-y-4">
              {[
                "Offline data collection and sync",
                "Barcode & QR code scanning",
                "Photo capture with annotations", 
                "GPS location tracking",
                "Real-time team collaboration"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-1 bg-success/20 rounded-full">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                  </div>
                  <span className="text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button className="flex items-center gap-3 bg-foreground text-background hover:bg-foreground/90">
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-3">
                <Play className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                4.9/5 rating from <strong>2,500+ reviews</strong>
              </div>
            </div>
          </div>
          
          {/* Right Content - Mobile App Mockup */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Phone mockup with floating elements */}
              <div className="relative max-w-sm mx-auto">
                <div className="relative shadow-glow rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-card to-muted p-2">
                  <div className="bg-foreground rounded-[2rem] p-1">
                    <img 
                      src={mobileAppImage}
                      alt="Modern mobile inspection app interface showing dashboard, scan functionality, and asset tracking features"
                      className="w-full h-auto rounded-[1.5rem]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -top-4 -left-8 glass-morphism p-3 rounded-xl shadow-soft animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Live Sync</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-8 glass-morphism p-4 rounded-xl shadow-soft animate-float" style={{ animationDelay: "1s" }}>
                <div className="text-lg font-bold text-primary">247</div>
                <div className="text-xs text-muted-foreground">Assets Scanned</div>
              </div>
              
              <div className="absolute top-1/2 -right-12 glass-morphism p-3 rounded-xl shadow-soft animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-warning" />
                  <span className="text-xs font-medium">Quick Actions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};