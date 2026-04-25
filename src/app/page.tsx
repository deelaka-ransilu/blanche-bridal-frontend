import LandingNav from "@/features/landing/components/LandingNav";
import HeroSection from "@/features/landing/components/HeroSection";
import AboutSection from "@/features/landing/components/AboutSection";
import ServicesSection from "@/features/landing/components/ServicesSection";
import GallerySection from "@/features/landing/components/GallerySection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import ContactSection from "@/features/landing/components/ContactSection";
import Footer from "@/features/landing/components/Footer";

export default function LandingPage() {
  return (
    <main className="bg-[#fffaf7]">
      <LandingNav />
      <section id="hero">
        <HeroSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <section id="services">
        <ServicesSection />
      </section>
      <section id="gallery">
        <GallerySection />
      </section>
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      <section id="contact">
        <ContactSection />
      </section>
      <Footer />
    </main>
  );
}
