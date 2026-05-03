"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api/inquiries";

const socials = [
  {
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M11.4 14.2c-.5 2.1-1.1 4.2-2.6 5.8-.2-2.3.4-4 1-5.8-.8-1.3.1-4 1.8-3.3 2.1.8-1.8 5 1 5.5 2.9.6 4.1-5 2.3-6.8-2.6-2.7-7.7-.1-7.1 3.8.1.8 1 1 .4 2-1.7-.4-2.2-1.8-2.1-3.7.2-3.1 2.8-5.3 5.5-5.6 3.5-.4 6.7 1.3 7.2 4.7.5 3.8-1.6 8-5.3 7.7-1-.1-1.9-.5-2.1-1.1Z"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M13.5 8.5H12c-.8 0-1.2.5-1.2 1.2V12H9v2h1.8v5h2.2v-5h1.8l.3-2H13v-1.8c0-.5.2-.8.8-.8h1.2V8.6c-.4-.1-.9-.1-1.5-.1Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Email",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 8l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function LeafAccent() {
  return (
    <svg viewBox="0 0 110 65" fill="none" className="hidden h-16 w-28 text-bridal-gold/65 md:block">
      <path d="M8 54C35 44 62 27 98 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M35 38c-14-3-20-13-20-13 12-3 20 1 20 13ZM58 27c-12-6-15-16-15-16 12 0 18 6 15 16ZM80 16c-9-7-10-16-10-16 10 2 14 8 10 16Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
    </svg>
  );
}

function Monogram() {
  return (
    <div className="flex h-20 w-14 items-center justify-center rounded-full border border-bridal-gold/45 bg-white/[0.03] text-bridal-gold">
      <div className="text-center">
        <span className="block font-cormorant text-4xl font-semibold leading-none">B</span>
        <span className="mx-auto mt-1 block h-px w-5 bg-bridal-gold/40" />
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className="relative min-h-[210px] overflow-hidden rounded-2xl border border-bridal-gold/20 bg-[#efe3d4] md:min-h-[235px]">
      <div className="absolute inset-0 opacity-55">
        <svg viewBox="0 0 700 320" className="h-full w-full">
          <path d="M-20 70C90 58 160 88 245 65C340 40 430 52 720 20" stroke="#d8c4a8" strokeWidth="6" fill="none" />
          <path d="M-10 170C120 145 180 190 300 165C415 142 505 160 720 120" stroke="#d8c4a8" strokeWidth="5" fill="none" />
          <path d="M60 -20C115 75 145 155 165 340" stroke="#ddccb6" strokeWidth="5" fill="none" />
          <path d="M250 -20C295 92 315 195 340 340" stroke="#ddccb6" strokeWidth="5" fill="none" />
          <path d="M460 -20C500 84 530 198 560 340" stroke="#ddccb6" strokeWidth="5" fill="none" />
          <path d="M-20 260C110 232 195 266 300 244C420 220 535 242 720 205" stroke="#d8c4a8" strokeWidth="4" fill="none" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-[#f7efe4]/45" />
      <div className="relative z-10 flex h-full min-h-[210px] flex-col items-center justify-center text-center md:min-h-[235px]">
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-bridal-gold">
          <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="currentColor" opacity="0.95" />
          <circle cx="12" cy="9" r="2.3" fill="#f7efe4" />
        </svg>
        <p className="mt-2 font-jost text-[0.68rem] font-bold uppercase tracking-[0.22em] text-bridal-text">Blanche</p>
        <p className="mt-1 font-jost text-[0.5rem] font-bold uppercase tracking-[0.25em] text-bridal-muted">Bridal Couture</p>
      </div>
      <div className="absolute right-4 top-5">
        <LeafAccent />
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "h-12 rounded-md border border-bridal-gold/22 bg-white/30 px-4 font-jost text-xs text-bridal-text placeholder:text-bridal-muted/65 outline-none transition-colors duration-300 focus:border-bridal-gold/65 w-full";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    weddingDate: "",
    style: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in your name, email, and message.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    // Build the message — fold weddingDate and style into message body
    // since CreateInquiryPayload doesn't have those fields separately
    const extraContext = [
      form.weddingDate ? `Wedding date: ${form.weddingDate}` : "",
      form.style ? `Preferred style: ${form.style}` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    const fullMessage = extraContext
      ? `${form.message}\n\n— ${extraContext}`
      : form.message;

    // Map style → subject
    const subjectMap: Record<string, string> = {
      western: "Western Gown",
      kandyan: "Kandyan Bride",
      saree: "Saree",
      lehenga: "Lehenga",
      modest: "Modest Bride",
    };

    try {
      await submitInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.style ? subjectMap[form.style] ?? "General" : "General",
        message: fullMessage.trim(),
      });

      setStatus("success");
      setForm({ name: "", email: "", phone: "", weddingDate: "", style: "", message: "" });
    } catch {
      setErrorMsg("Something went wrong. Please try again or contact us directly.");
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="bg-bridal-bg px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-bridal-dark p-3 shadow-[0_30px_80px_rgba(23,16,12,0.18)] md:rounded-[2.5rem]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/8 bg-[#f7efe4] md:rounded-[2rem]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,255,255,0.82),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(207,167,125,0.14),transparent_28%)]" />

          <div className="relative z-10 grid gap-8 px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14 lg:grid-cols-[1fr_0.95fr] lg:gap-12 lg:px-12">

            {/* Left — form */}
            <div>
              <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.28em] text-bridal-gold md:text-[0.66rem]">
                Contact Our Atelier
              </p>

              <div className="mt-4 flex items-center gap-5">
                <h2 className="max-w-xl font-cormorant text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-bridal-text">
                  Let&apos;s begin your
                  <br />
                  bridal journey
                </h2>
                <LeafAccent />
              </div>

              <p className="mt-6 max-w-lg font-jost text-sm font-medium leading-relaxed text-bridal-text/72 md:text-base">
                We would be honored to be part of your story. Book a private
                consultation or get in touch with our atelier.
              </p>

              {/* Success state */}
              {status === "success" ? (
                <div className="mt-7 flex flex-col items-start gap-4 rounded-xl border border-bridal-gold/30 bg-white/40 px-6 py-8">
                  <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-bridal-gold">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="font-cormorant text-2xl font-medium text-bridal-text">
                      Thank you for reaching out.
                    </p>
                    <p className="mt-2 font-jost text-xs leading-relaxed text-bridal-muted">
                      We&apos;ve received your inquiry and will be in touch within one business day.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-2 font-jost text-[0.6rem] font-bold uppercase tracking-[0.14em] text-bridal-gold underline-offset-4 hover:underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <div className="mt-7 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full Name *"
                      className={INPUT_CLASS}
                    />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address *"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (optional)"
                    className={INPUT_CLASS}
                  />

                  <div className="relative">
                    <input
                      type="text"
                      name="weddingDate"
                      value={form.weddingDate}
                      onChange={handleChange}
                      placeholder="Wedding Date (optional)"
                      className={`${INPUT_CLASS} pr-12`}
                    />
                    <svg viewBox="0 0 24 24" fill="none" className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bridal-gold/70">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="relative">
                    <select
                      name="style"
                      value={form.style}
                      onChange={handleChange}
                      className="h-12 w-full appearance-none rounded-md border border-bridal-gold/22 bg-white/30 px-4 pr-12 font-jost text-xs text-bridal-muted/75 outline-none transition-colors duration-300 focus:border-bridal-gold/65"
                    >
                      <option value="">Preferred Style (optional)</option>
                      <option value="western">Western Gown</option>
                      <option value="kandyan">Kandyan Bride</option>
                      <option value="saree">Saree</option>
                      <option value="lehenga">Lehenga</option>
                      <option value="modest">Modest Bride</option>
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bridal-gold/70">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Message *"
                    rows={4}
                    className="resize-none rounded-md border border-bridal-gold/22 bg-white/30 px-4 py-4 font-jost text-xs text-bridal-text placeholder:text-bridal-muted/65 outline-none transition-colors duration-300 focus:border-bridal-gold/65 w-full"
                  />

                  {status === "error" && (
                    <p className="font-jost text-xs text-red-600">{errorMsg}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    className="inline-flex h-12 items-center justify-center bg-bridal-gold px-8 font-jost text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white transition-opacity duration-300 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending…" : "Send inquiry"}
                  </button>
                </div>
              )}
            </div>

            {/* Right — map + details */}
            <div className="flex flex-col gap-4">
              <MapCard />

              <div className="rounded-2xl border border-bridal-gold/20 bg-white/28 p-6 shadow-[0_16px_40px_rgba(23,16,12,0.06)]">
                <p className="font-jost text-[0.64rem] font-bold uppercase tracking-[0.24em] text-bridal-gold">
                  Atelier Details
                </p>

                <div className="mt-5 flex flex-col gap-4">
                  <div className="flex gap-3">
                    <ContactIcon type="pin" />
                    <p className="font-jost text-xs leading-relaxed text-bridal-text/72">
                      Blanche Bridal Couture
                      <br />
                      Near Jayani Communication,
                      <br />
                      Piliyandala
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <ContactIcon type="phone" />
                    <p className="font-jost text-xs leading-relaxed text-bridal-text/72">+94 XX XXX XXXX</p>
                  </div>
                  <div className="flex gap-3">
                    <ContactIcon type="mail" />
                    <p className="font-jost text-xs leading-relaxed text-bridal-text/72">hello@blanchebridal.lk</p>
                  </div>
                  <div className="flex gap-3">
                    <ContactIcon type="clock" />
                    <p className="font-jost text-xs leading-relaxed text-bridal-text/72">
                      By Appointment Only
                      <br />
                      Monday — Saturday, 10AM — 6PM
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-6 text-bridal-gold">
                  {socials.map((social) => (
                    <a key={social.label} href="#" aria-label={social.label} className="transition-opacity duration-300 hover:opacity-70">
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dark bottom quote strip */}
          <div className="relative z-10 bg-bridal-dark px-5 py-7 md:px-8 lg:px-12">
            <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_1fr]">
              <Monogram />
              <div className="hidden h-16 w-px bg-white/14 md:block" />
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <p className="font-cormorant text-2xl italic leading-snug text-white/82 md:text-3xl">
                  &ldquo;Every detail, every stitch,
                  <br className="hidden sm:block" />
                  every moment is crafted for you.&rdquo;
                </p>
                <div className="border-white/14 md:border-l md:pl-10">
                  <p className="font-jost text-[0.62rem] font-bold uppercase tracking-[0.3em] text-white/70">
                    Blanche Bridal Couture
                  </p>
                  <p className="mt-2 font-cormorant text-lg italic text-white/45">
                    Timeless. Personal. Unforgettable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactIcon({ type }: { type: "pin" | "phone" | "mail" | "clock" }) {
  const iconClass = "h-5 w-5 text-bridal-gold shrink-0";

  if (type === "pin") return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );

  if (type === "phone") return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path
        d="M21 16.5v2.7a1.8 1.8 0 0 1-2 1.8A17 17 0 0 1 4 6a1.8 1.8 0 0 1 1.8-2h2.7a1.5 1.5 0 0 1 1.5 1.2l.6 2.6a1.6 1.6 0 0 1-.4 1.5L9 10.5a12.5 12.5 0 0 0 4.5 4.5l1.2-1.2a1.6 1.6 0 0 1 1.5-.4l2.6.6a1.5 1.5 0 0 1 1.2 1.5Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );

  if (type === "mail") return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}