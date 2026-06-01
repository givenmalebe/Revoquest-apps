import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  ArrowRight,
  LogIn,
  ChevronDown,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { RegistrationForm } from "@/components/RegistrationForm";
import revoquestLogo from "@/assets/revoquest-logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnrollClick = () => {
    setIsRegistrationOpen(true);
    setIsMenuOpen(false); // Close mobile menu if open
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCareersDropdownOpen(false);
      }
    };

    if (isCareersDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCareersDropdownOpen]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false); // Close mobile menu
    setIsCareersDropdownOpen(false); // Close dropdown

    if (href.startsWith('#')) {
      // Handle hash links (scroll to sections on home page)
      if (location.pathname === '/') {
        // If we're on the home page, scroll to the section
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If we're on a different page, navigate to home first, then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      // Handle route links (navigate to other pages)
      navigate(href);
    }
  };

  const navItems = [
    { label: "HOME", href: "#home" },
    { label: "COURSES", href: "/courses" },
    { label: "BLOG", href: "/funnel/blog" },
    { label: "FUNDI STUDENT LOANS", href: "/fundi-student-loans" },
    { label: "GALLERY", href: "/gallery" },
    { label: "ASSESSMENT CENTRE", href: "/assessment-centre" },
    { label: "EDST", href: "/careers?tab=edst" },
    {
      label: "CAREERS",
      href: "/careers",
      hasDropdown: true,
      dropdownItems: [
        { label: "Job Opportunities", href: "/careers?tab=careers", icon: Briefcase }
      ]
    },
    { label: "ABOUT US", href: "/about" },
    { label: "CONTACT", href: "/contact" }
  ];

  return (
    <>
      {/* Main Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={revoquestLogo} 
                alt="RevoQuest Logo" 
                className="w-36 h-36 object-contain"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative" ref={item.hasDropdown ? dropdownRef : null}>
                  {item.hasDropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsCareersDropdownOpen(!isCareersDropdownOpen)}
                        className="flex items-center gap-1 text-xs font-medium text-foreground/80 hover:text-primary transition-colors"
                      >
                        {item.label}
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {/* Dropdown Menu */}
                      {isCareersDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 z-50">
                          {item.dropdownItems?.map((dropdownItem) => {
                            const IconComponent = dropdownItem.icon;
                            return (
                              <button
                                key={dropdownItem.label}
                                onClick={() => {
                                  handleNavClick(dropdownItem.href);
                                  setIsCareersDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-orange-600 transition-colors"
                              >
                                <IconComponent className="w-4 h-4" />
                                {dropdownItem.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="text-xs font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/lms'}
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Button 
                onClick={handleEnrollClick}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                Enroll Today
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className={cn(
            "md:hidden transition-all duration-300",
            isMenuOpen ? "max-h-[calc(100vh-4rem)] opacity-100 overflow-y-auto overscroll-contain" : "max-h-0 opacity-0 overflow-hidden"
          )}>
            <nav className="py-4 pb-6 space-y-4 border-t border-border/50">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.hasDropdown ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-foreground/80 py-2">
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-2">
                        {item.dropdownItems?.map((dropdownItem) => {
                          const IconComponent = dropdownItem.icon;
                          return (
                            <button
                              key={dropdownItem.label}
                              onClick={() => handleNavClick(dropdownItem.href)}
                              className="flex items-center gap-2 text-xs text-foreground/60 hover:text-primary transition-colors py-1 w-full text-left"
                            >
                              <IconComponent className="w-3 h-3" />
                              {dropdownItem.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="block text-xs font-medium text-foreground/80 hover:text-primary transition-colors py-2 w-full text-left"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/lms'}
                  className="w-full flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button
                  onClick={handleEnrollClick}
                  className="group w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                >
                  Enroll Today
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Registration Form Modal */}
      <RegistrationForm 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </>
  );
};