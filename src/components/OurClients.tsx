import { useEffect, useRef } from "react";

const clients = [
  {
    id: 1,
    name: "Services SETA",
    logo: "/services seta.png"
  },
  {
    id: 2,
    name: "INSETA",
    logo: "/inseta-logo.png"
  },
  {
    id: 3,
    name: "PSETA",
    logo: "/Pseta logo.png"
  },
  {
    id: 4,
    name: "CETA",
    logo: "/ceta logo.png"
  },
  {
    id: 5,
    name: "Gert Sibande TVET College",
    logo: "/Gert-Sibande-TVET-College-logo-symbol-scaled.webp"
  },
  {
    id: 6,
    name: "IDT",
    logo: "/IDT_independent_development_trust_(idt).png"
  },
  {
    id: 7,
    name: "Infraco",
    logo: "/Infra-touch-logo-RGB.png"
  },
  {
    id: 8,
    name: "JRA",
    logo: "/JRA.jpeg"
  }
];

export const OurClients = () => {
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
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.15),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
            Our Clients
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Trusted by leading organizations and institutions across South Africa
          </p>
        </div>

        {/* Animated Clients Container */}
        <div 
          ref={containerRef}
          className="flex gap-8 overflow-x-hidden scrollbar-hide"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Duplicate clients for seamless loop */}
          {[...clients, ...clients].map((client, index) => (
            <div
              key={`${client.id}-${index}`}
              className="flex-shrink-0 w-48 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-full h-20 flex items-center justify-center mb-3">
                <img
                  src={client.logo}
                  alt={`${client.name} logo`}
                  className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white text-center">
                {client.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
