"use client";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { motion } from "framer-motion";

const placeholderImages = [
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109752/69b349a7397c4cccec1f6d006487b74f_yftrs1.jpg",
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109751/5946515c7a596c74d21f16caffe57223_iunmx1.jpg",
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109751/b72353683f5ef51bfadd8deb18ab06b4_hjvjs0.jpg",
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109751/9832111b266d4f060623746e2c5ed2a1_ujamqi.jpg",
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109749/4db57d8da8f63b7ebe1060120bcf7a5e_d324yo.jpg",
  "https://res.cloudinary.com/dctbdkkrk/image/upload/v1777109749/1e3a95099478ef9efd34e7f2ea155c5e_ogzwk4.jpg",
];

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
