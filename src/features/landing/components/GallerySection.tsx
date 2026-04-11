"use client";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { motion } from "framer-motion";

const placeholderImages = Array.from(
  { length: 9 },
  (_, i) => `https://picsum.photos/seed/bridal${i + 1}/400/600`,
);

export default function GallerySection() {
  return (
    <section className="bg-[#F8F4E3] py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase mb-3">
            Our collection
          </p>
          <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26]">
            A glimpse of <em className="italic text-[#A86A4B]">elegance</em>
          </h2>
          <p className="text-[#5B3E26]/70 mt-4 max-w-md mx-auto text-sm">
            Each gown is carefully selected to represent the finest in bridal
            fashion.
          </p>
        </motion.div>
        <ParallaxScroll images={placeholderImages} />
      </div>
    </section>
  );
}
