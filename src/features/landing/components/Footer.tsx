"use client";

import Link from "next/link";
import { useState } from "react";
import { submitInquiry } from "@/lib/api/inquiries";

const navLinks = [
  { label: "Collections", href: "/#collections" },
  { label: "Book Fitting", href: "/booking" },
  { label: "Inquiry", href: "/inquiry" },
  { label: "Catalog", href: "/catalog" },
];

const socials = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Pinterest", href: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("loading");
    try {
      await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        subject: "General",
      });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer id="contact" className="relative overflow-hidden bg-bridal-dark px-4 py-20 text-white md:px-8 md:py-28">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(207,167,125,0.12),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">

        {/* ── Top: brand + tagline ── */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-12 items-center justify-center rounded-full border border-bridal-gold/40 text-bridal-gold">
            <div className="text-center">
              <span className="block font-cormorant text-3xl font-semibold leading-none">B</span>
              <span className="mx-auto mt-1 block h-px w-4 bg-bridal-gold/40" />
            </div>
          </div>

          <h2 className="mt-6 font-cormorant text-[clamp(2.8rem,7vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white">
            Let&apos;s begin your
            <br />
            bridal journey
          </h2>

          <p className="mt-5 max-w-md font-jost text-xs font-medium leading-relaxed text-white/50">
            Reach out to our atelier and take the first step toward your
            dream gown. We&apos;d love to hear from you.
          </p>
        </div>

        {/* ── Middle: quick contact form ── */}
        <div className="mx-auto mt-12 max-w-xl">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-bridal-gold/20 bg-white/[0.04] px-8 py-10 text-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-bridal-gold">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="font-cormorant text-2xl font-medium text-white">
                Thank you for reaching out.
              </p>
              <p className="font-jost text-xs text-white/45">
                We&apos;ll be in touch within one business day.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.16em] text-bridal-gold hover:opacity-70"
              >
                Send another
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name *"
                  className="h-12 rounded-lg border border-white/12 bg-white/[0.06] px-4 font-jost text-xs text-white placeholder:text-white/30 outline-none transition-colors focus:border-bridal-gold/50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="h-12 rounded-lg border border-white/12 bg-white/[0.06] px-4 font-jost text-xs text-white placeholder:text-white/30 outline-none transition-colors focus:border-bridal-gold/50"
                />
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message *"
                rows={4}
                className="resize-none rounded-lg border border-white/12 bg-white/[0.06] px-4 py-3 font-jost text-xs text-white placeholder:text-white/30 outline-none transition-colors focus:border-bridal-gold/50"
              />

              {status === "error" && (
                <p className="font-jost text-xs text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="h-12 bg-bridal-gold font-jost text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Sending…" : "Send Inquiry"}
              </button>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="mx-auto mt-16 flex max-w-xs items-center gap-4 md:mt-20">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-bridal-gold/50 text-sm">✦</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* ── Bottom: links + info + copyright ── */}
        <div className="mt-10 grid gap-8 text-center md:grid-cols-3 md:text-left">

          {/* Brand info */}
          <div>
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold">
              Blanche Bridal Couture
            </p>
            <p className="mt-3 font-jost text-xs leading-relaxed text-white/40">
              Near Jayani Communication,
              <br />
              Piliyandala, Sri Lanka
            </p>
            <p className="mt-2 font-jost text-xs text-white/40">
              Mon — Sat, 10AM — 6PM
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-cormorant text-lg italic text-white/50 transition-colors hover:text-bridal-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Socials + quote */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex gap-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-bridal-gold"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <p className="font-cormorant text-base italic text-white/30 md:text-right">
              Timeless. Personal. Unforgettable.
            </p>
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-10 border-t border-white/8 pt-6 text-center">
          <p className="font-jost text-[0.55rem] uppercase tracking-[0.2em] text-white/20">
            © 2025 Blanche Bridal Couture. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}