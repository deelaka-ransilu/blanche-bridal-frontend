"use client";
import { Timeline } from "@/components/ui/timeline";
import { motion } from "framer-motion";

const timelineData = [
  {
    title: "2014",
    content: (
      <div>
        <p className="text-[#5B3E26]/80 text-sm leading-relaxed mb-3">
          Blanche Bridal opens its doors in Piliyandala with a carefully curated
          collection of 50 bridal gowns. Founded with a simple belief — every
          bride deserves to feel extraordinary.
        </p>
        <div className="bg-[#E9D9B6] border border-[#D9C4A0] rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-[#A86A4B] tracking-wide">
            Our first bride walked out smiling ✦
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "2017",
    content: (
      <div>
        <p className="text-[#5B3E26]/80 text-sm leading-relaxed mb-3">
          We expanded to over 200 gowns and introduced our professional
          alteration service, ensuring every gown fits its bride perfectly.
        </p>
        <div className="bg-[#E9D9B6] border border-[#D9C4A0] rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-[#A86A4B] tracking-wide">
            500+ brides served by this milestone
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "2020",
    content: (
      <div>
        <p className="text-[#5B3E26]/80 text-sm leading-relaxed mb-3">
          We continued serving brides with private appointments and launched our
          measurement tracking system for perfectly fitted gowns.
        </p>
        <div className="bg-[#E9D9B6] border border-[#D9C4A0] rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-[#A86A4B] tracking-wide">
            Resilience defines us ✦
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div>
        <p className="text-[#5B3E26]/80 text-sm leading-relaxed mb-3">
          Today Blanche Bridal houses over 500 gowns and has served 1,200+
          brides. We launched our online booking system to serve you even
          better.
        </p>
        <div className="bg-[#E9D9B6] border border-[#D9C4A0] rounded-xl px-4 py-3 inline-block">
          <p className="text-xs text-[#A86A4B] tracking-wide">
            The journey continues ✦
          </p>
        </div>
      </div>
    ),
  },
];

export default function OurStorySection() {
  return (
    <section className="bg-[#F8F4E3]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <p className="text-xs tracking-[0.2em] text-[#A86A4B] uppercase mb-3">
            Our journey
          </p>
          <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26]">
            A decade of{" "}
            <em className="italic text-[#A86A4B]">beautiful moments</em>
          </h2>
        </motion.div>
      </div>
      <Timeline data={timelineData} />
    </section>
  );
}
