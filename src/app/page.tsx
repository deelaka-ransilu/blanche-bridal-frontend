import HeroSection from "@/features/landing/components/HeroSection";
import CollectionsSection from "@/features/landing/components/CollectionsSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import JourneySection from "@/features/landing/components/JourneySection";
import ContactSection from "@/features/landing/components/ContactSection";
import Footer from "@/features/landing/components/Footer";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <CollectionsSection />
      <TestimonialsSection />
      <JourneySection />
      <ContactSection />
      <Footer />
    </main>
  );
}
