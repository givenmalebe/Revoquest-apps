import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Facebook, Linkedin, Clock, Instagram, Youtube, Music } from "lucide-react";
import revoquestLogo from "@/assets/revoquest-logo.png";

interface FooterProps {
  logoSrc?: string;
}

export const Footer = ({ logoSrc }: FooterProps = {}) => {
  const logo = logoSrc ?? revoquestLogo;
  const footerSections = [
    {
      title: "Courses",
      links: [
        { label: "Quality Manager", href: "/courses?search=Quality%20Manager" },
        { label: "Small Business Consultant", href: "/courses?search=Small%20Business%20Consultant" },
        { label: "Workplace Safety", href: "/courses?search=Construction%20Health%20and%20Safety" },
        { label: "Safety Inspector", href: "/courses?search=Safety%20Inspector" },
        { label: "All Courses", href: "/courses" }
      ]
    },
    {
      title: "Learning Paths",
      links: [
        { label: "Short Courses", href: "/courses?category=Short%20Courses" },
        { label: "RPL Programmes", href: "/rpl" },
        { label: "Online Learning", href: "/lms" },
        { label: "Professional Development", href: "/courses?category=Professional%20Development" },
        { label: "Certification", href: "/assessment-centre" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Student Portal", href: "/lms" },
        { label: "Course Materials", href: "/lms" },
        { label: "Technical Support", href: "mailto:info@revoquest.co.za?subject=Technical%20Support" },
        { label: "Study Groups", href: "/lms" },
        { label: "Career Guidance", href: "/careers" }
      ]
    },
    {
      title: "Institute",
      links: [
        { label: "Revo Learn", href: "/funnel" },
        { label: "Blog", href: "/funnel/blog" },
        { label: "About Us", href: "/about" },
        { label: "Our Mission", href: "/about#mission" },
        { label: "Accreditation", href: "/about#accreditation" },
        { label: "Success Stories", href: "/about#testimonials" },
        { label: "Contact Us", href: "/contact" }
      ]
    }
  ];

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="RevoQuest Logo" 
                className="w-24 h-24 object-contain bg-white rounded-lg p-2"
              />
            </div>
            
            <p className="text-primary-foreground/80 leading-relaxed max-w-sm">
              {logoSrc
                ? "Professional your career with accreditated short courses with our flexible AI powered platform. Powered by revoquest institute"
                : "Revolutionizing professional development through Recognition of Prior Learning (RPL) and industry-focused training programs."}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@revoquest.co.za" className="hover:text-primary transition-colors">
                  info@revoquest.co.za
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+27105953692" className="hover:text-primary transition-colors">
                  010 595 3692
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>Mon - Fri: 8:00 - 16:30</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-auto text-primary-foreground hover:text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://www.facebook.com/revoquestinstitute" target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-auto text-primary-foreground hover:text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://www.instagram.com/_revoquest_institute/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-auto text-primary-foreground hover:text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://www.youtube.com/channel/UCp-3Zk6jIJuIId80hxsfAjQ" target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-auto text-primary-foreground hover:text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://www.tiktok.com/@revoquest_institute" target="_blank" rel="noopener noreferrer">
                  <Music className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 h-auto text-primary-foreground hover:text-primary hover:bg-primary/10"
                asChild
              >
                <a href="https://www.linkedin.com/company/revoquest-inc/posts/?feedView=all" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
          
          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-semibold text-primary">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <Separator className="mb-8 bg-primary-foreground/20" />
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-primary-foreground/70">
            © 2025 Revo Quest Institute. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-primary-foreground/70">
            <a href="/about#privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/about#terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/about#accreditation" className="hover:text-primary transition-colors">
              Accreditation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};