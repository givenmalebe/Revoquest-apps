import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { PopularCourses } from "@/components/PopularCourses";
import { GoogleReviews } from "@/components/GoogleReviews";
import { OurClients } from "@/components/OurClients";
import { ContactPage } from "@/components/ContactPage";
import { Footer } from "@/components/Footer";
import WhatsAppChat from "@/components/WhatsAppChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <PopularCourses />
        <GoogleReviews />
        <OurClients />
        <ContactPage showHeader={false} />
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Index;
