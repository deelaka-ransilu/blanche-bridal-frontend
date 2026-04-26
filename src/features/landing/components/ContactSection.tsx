"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const contactInfo = [
  {
    label: "Address",
    value: "Near Jayani Communication, Piliyandala, Western Province",
    icon: "📍",
  },
  { label: "Phone", value: "+94 77 123 4567", icon: "📞" },
  { label: "Email", value: "hello@blanchebridal.com", icon: "✉️" },
  {
    label: "Opening hours",
    value: "Mon – Sat: 9am – 7pm  |  Sunday: 10am – 4pm",
    icon: "🕐",
  },
];

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

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
            Get in touch
          </p>
          <h2 className="text-3xl lg:text-4xl font-light text-[#5B3E26]">
            Visit us or send a{" "}
            <em className="italic text-[#A86A4B]">message</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-[#F8F4E3] border border-[#D9C4A0] flex items-center justify-center text-base flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-[#A86A4B] tracking-widest uppercase mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-[#5B3E26]">{item.value}</p>
                </div>
              </motion.div>
            ))}
            <div className="mt-4 h-48 rounded-xl overflow-hidden border border-[#C49C74]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d990.427303722848!2d79.9481238832896!3d6.805184233425946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2592ba8857a5b%3A0x2059bfe84ce4e125!2sBlanche%20Bridal%20%26%20Dress!5e0!3m2!1sen!2slk!4v1777117915095!5m2!1sen!2slk"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-20"
              >
                <div className="w-16 h-16 rounded-full bg-[#F8F4E3] border border-[#D9C4A0] flex items-center justify-center text-2xl">
                  ✦
                </div>
                <p className="text-lg text-[#5B3E26] font-medium">
                  Message sent!
                </p>
                <p className="text-sm text-[#5B3E26]/70 text-center">
                  Thank you for reaching out. We&apos;ll get back to you within
                  24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9C4A0] bg-[#F8F4E3] text-sm text-[#120C08] placeholder:text-[#C49C74] outline-none focus:border-[#A86A4B] transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9C4A0] bg-[#F8F4E3] text-sm text-[#120C08] placeholder:text-[#C49C74] outline-none focus:border-[#A86A4B] transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Phone number"
                  className="w-full px-4 py-3 rounded-xl border border-[#D9C4A0] bg-[#F8F4E3] text-sm text-[#120C08] placeholder:text-[#C49C74] outline-none focus:border-[#A86A4B] transition-colors"
                />
                <input
                  type="text"
                  placeholder="Subject (e.g. gown rental inquiry)"
                  className="w-full px-4 py-3 rounded-xl border border-[#D9C4A0] bg-[#F8F4E3] text-sm text-[#120C08] placeholder:text-[#C49C74] outline-none focus:border-[#A86A4B] transition-colors"
                />
                <textarea
                  placeholder="Tell us about your dream gown or inquiry..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-[#D9C4A0] bg-[#F8F4E3] text-sm text-[#120C08] placeholder:text-[#C49C74] outline-none focus:border-[#A86A4B] transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="self-start px-8 py-3 bg-[#A86A4B] text-white text-sm rounded-full hover:bg-[#5B3E26] transition-all duration-200 tracking-wide"
                >
                  Send message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
