"use client";
import { ThreeDCardEffect } from "@/components/ui/3d-card-effect";
import { motion } from "framer-motion";

const services = [
  {
    icon: "✦",
    title: "Gown rental",
    description:
      "Choose from our curated collection of designer bridal gowns. Affordable luxury with full fitting support included.",
    highlight: "From LKR 15,000",
  },
  {
    icon: "◈",
    title: "Gown purchase",
    description:
      "Own your dream gown forever. A wide selection across styles and budgets — from elegant ballgowns to sleek modern silhouettes.",
    highlight: "Personalised pricing",
  },
  {
    icon: "❋",
    title: "Styling consultation",
    description:
      "Our experienced stylists help you find the perfect gown that complements your body, personality and wedding theme.",
    highlight: "Complimentary session",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#E9D9B6] py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase mb-3">
            What we offer
          </p>
          <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26]">
            Our <em className="italic text-[#A86A4B]">services</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <ThreeDCardEffect>
                <div className="bg-[#F8F4E3] border border-[#D9C4A0] rounded-2xl p-8 h-full flex flex-col gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#E9D9B6] flex items-center justify-center text-[#A86A4B] text-xl">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#5B3E26] mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#5B3E26]/80 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <span className="text-xs bg-[#E9D9B6] text-[#A86A4B] px-3 py-1 rounded-full tracking-wide border border-[#D9C4A0]">
                      {service.highlight}
                    </span>
                  </div>
                </div>
              </ThreeDCardEffect>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
