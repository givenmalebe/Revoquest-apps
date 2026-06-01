import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Lebo Mokoallo",
    date: "2025-06-02",
    rating: 5,
    text: "I'd recommend Revo Quest to everyone anyday. Very professional.",
    avatar: null // Will use initials instead
  },
  {
    id: 2,
    name: "MOLEBOGENG MOKHONWANA",
    date: "2025-05-29",
    rating: 5,
    text: "I'm doing my internship program here, and I can confidently say their service is excellent. I'm really happy with the experience I'm getting. It's clear they want the best for...",
    avatar: null // Will use initials instead
  },
  {
    id: 3,
    name: "Herold poopedi",
    date: "2025-05-29",
    rating: 4,
    text: "I had a great experience working with the guys at RevoQuest. They were helpful and knowledgeable.",
    avatar: null // Will use initials instead
  },
  {
    id: 4,
    name: "Angie Atechs",
    date: "2025-05-29",
    rating: 5,
    text: "Excellent Team 👏👏",
    avatar: null // Will use initials instead
  },
  {
    id: 5,
    name: "khotso masilela",
    date: "2025-05-29",
    rating: 5,
    text: "Looking at where I'm from against where I'd like to be, I take pride in being a young professional. RevoQuest Training Institute is a powerhouse in professional development...",
    avatar: null // Will use initials instead
  },
  {
    id: 6,
    name: "Andre Manse",
    date: "2025-05-28",
    rating: 5,
    text: "I did my health and safety course, they are very supportive team, especially Brian, always ready to answer queries and my certificate was even couriered when I requested. I'd...",
    avatar: null // Will use initials instead
  }
];

export const GoogleReviews = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isResetting = false;

    const scroll = () => {
      if (isResetting) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      const halfScroll = maxScroll / 2; // Since we duplicate the items, half is where we reset
      
      if (container.scrollLeft >= halfScroll) {
        isResetting = true;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = 0;
        setTimeout(() => {
          container.style.scrollBehavior = 'smooth';
          isResetting = false;
        }, 1000); // 1 second pause between loops
      } else {
        container.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
            What Our Students Say
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Real reviews from our satisfied students and professionals
          </p>
        </div>

        {/* Animated Reviews Container */}
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-hidden scrollbar-hide"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Duplicate reviews for seamless loop */}
          {[...reviews, ...reviews].map((review, index) => (
            <Card 
              key={`${review.id}-${index}`}
              className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
            >
              <CardContent className="p-6">
                {/* Google Logo and Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Google</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Verified</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < review.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm leading-relaxed">
                  "{review.text}"
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {review.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {review.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {review.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Google Reviews Link */}
        <div className="text-center mt-8">
          <a 
            href="https://www.google.com/search?q=RevoQuest+Institute+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm font-medium"
          >
            View all reviews on Google
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
