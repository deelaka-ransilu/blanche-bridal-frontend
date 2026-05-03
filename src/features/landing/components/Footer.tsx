export default function Footer() {
  const footerLinks = [
    { label: "Collections", href: "#collections" },
    { label: "Bridal Journey", href: "#journey" },
    { label: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "TikTok", href: "#" },
  ];

  return (
    <footer className="relative overflow-hidden bg-bridal-dark px-4 py-16 text-white md:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(207,167,125,0.13),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.04),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <p className="font-jost text-[0.58rem] font-bold uppercase tracking-[0.32em] text-bridal-gold">
              Blanche Bridal Couture
            </p>

            <h2 className="mt-4 max-w-2xl font-cormorant text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-white">
              Designed for
              <br />
              unforgettable brides.
            </h2>

            <p className="mt-5 max-w-md font-jost text-sm leading-relaxed text-white/50">
              Piliyandala&apos;s premier bridal boutique for timeless gowns,
              personal fittings, and elegant wedding moments.
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:items-end">
            <a
              href="#contact"
              className="inline-flex w-fit items-center justify-center bg-bridal-gold px-8 py-3.5 font-jost text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white transition-opacity duration-300 hover:opacity-85"
            >
              Book a fitting
            </a>

            <div className="flex h-20 w-14 items-center justify-center rounded-full border border-bridal-gold/45 bg-white/[0.03] text-bridal-gold">
              <div className="text-center">
                <span className="block font-cormorant text-4xl font-semibold leading-none">
                  B
                </span>
                <span className="mx-auto mt-1 block h-px w-5 bg-bridal-gold/40" />
              </div>
            </div>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-white/10" />

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-4 font-jost text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/35">
              Explore
            </p>

            <div className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-cormorant text-xl italic text-white/65 transition-colors duration-300 hover:text-bridal-gold"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 font-jost text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/35">
              Visit
            </p>

            <p className="font-jost text-sm leading-relaxed text-white/55">
              Near Jayani Communication,
              <br />
              Piliyandala
            </p>

            <p className="mt-4 font-jost text-sm leading-relaxed text-white/55">
              Mon — Sat, 9AM — 7PM
              <br />
              Sunday by appointment
            </p>
          </div>

          <div>
            <p className="mb-4 font-jost text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/35">
              Social
            </p>

            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={`Visit Blanche Bridal on ${social.label}`}
                  className="font-jost text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 hover:text-bridal-gold"
                >
                  {social.label}
                </a>
              ))}
            </div>

            <p className="mt-5 font-cormorant text-lg italic text-white/45">
              Timeless. Personal. Unforgettable.
            </p>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-white/10" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-cormorant text-base italic text-white/45">
            “Every detail, every stitch, every moment is crafted for you.”
          </p>

          <p className="font-jost text-[0.6rem] uppercase tracking-[0.16em] text-white/30">
            © 2025 Blanche Bridal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}