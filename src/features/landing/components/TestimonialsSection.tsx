"use client";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Blanche Bridal made my wedding day absolutely magical. The team understood exactly what I wanted and found me the perfect gown!",
    name: "Sanduni Perera",
    title: "Bride, December 2024",
  },
  {
    quote:
      "The rental service is amazing value. My gown was stunning and the fitting was perfect. Everyone kept asking where I got it from.",
    name: "Nimasha Fernando",
    title: "Bride, October 2024",
  },
  {
    quote:
      "I visited many boutiques but nothing compared to the personalised experience at Blanche Bridal. They truly care about each bride.",
    name: "Dilini Jayawardena",
    title: "Bride, August 2024",
  },
  {
    quote:
      "From consultation to final fitting — every step was handled with such care and professionalism. Cannot recommend them enough!",
    name: "Thilini Rathnayake",
    title: "Bride, November 2024",
  },
  {
    quote:
      "The gown selection is incredible. I found my dream dress within the first visit. A truly stress-free and enjoyable experience.",
    name: "Sachini Silva",
    title: "Bride, September 2024",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#E9D9B6] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase mb-3">
            Love stories
          </p>
          <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26]">
            What our <em className="italic text-[#A86A4B]">brides say</em>
          </h2>
        </motion.div>
      </div>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </section>
  );
}
