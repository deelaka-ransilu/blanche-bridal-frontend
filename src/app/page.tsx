import { PublicNav } from "@/components/shared/PublicNav";
import HeroSection from "@/features/landing/components/HeroSection";
import CollectionsSection from "@/features/landing/components/CollectionsSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import JourneySection from "@/features/landing/components/JourneySection";
import Footer from "@/features/landing/components/Footer";

export default function LandingPage() {
  return (
    <>
      <PublicNav transparent />
      <main>
        <HeroSection />
        <CollectionsSection />
        <TestimonialsSection />
        <JourneySection />
        <Footer />
      </main>
    </>
  );
}