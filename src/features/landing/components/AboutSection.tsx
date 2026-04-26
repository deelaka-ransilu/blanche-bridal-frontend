"use client";
import Image from "next/image";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { motion } from "framer-motion";

const features = [
  "Personalised one-on-one styling consultations",
  "Professional in-house alteration service",
  "Flexible rental and purchase options",
  "Accurate bridal measurement tracking",
  "Expert team with 10+ years of experience",
];

export default function AboutSection() {
  return (
    <section className="bg-[#F8F4E3] py-24 px-6 lg:px-12">
      <TracingBeam className="px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[480px] rounded-2xl overflow-hidden bg-[#E9D9B6]"
          >
            <Image
              src="https://res.cloudinary.com/dctbdkkrk/image/upload/v1777107404/botqiue-image_gijczn.jpg"
              alt="Hero Image"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#A86A4B] opacity-40" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#A86A4B] opacity-40" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            <p className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase">
              About us
            </p>
            <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26] leading-snug">
              Where every bride finds her{" "}
              <em className="italic text-[#A86A4B]">perfect moment</em>
            </h2>
            <p className="text-[#5B3E26]/80 leading-relaxed">
              Located near Jayani Communication in Piliyandala, Blanche Bridal
              has been the trusted destination for brides across the Western
              Province. We curate only the finest gowns — each one chosen to
              make you feel radiant, confident, and unforgettable on your most
              special day.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              {features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-[#5B3E26]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#A86A4B] flex-shrink-0" />
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </TracingBeam>
    </section>
  );
}
