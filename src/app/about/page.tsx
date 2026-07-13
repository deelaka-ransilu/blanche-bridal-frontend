import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { BookFittingButton } from "@/components/book-fitting-button";
import { SiteFooter } from "@/components/site-footer";

const STEPS = [
  {
    number: "01",
    title: "Consultation",
    body: "Share your vision, we help shape it into a design.",
  },
  {
    number: "02",
    title: "Measurements",
    body: "Precise fitting details taken to build your pattern.",
  },
  {
    number: "03",
    title: "Craftsmanship",
    body: "Your gown is made by hand, stage by stage.",
  },
  {
    number: "04",
    title: "Fitting day",
    body: "Final adjustments, then it's ready for your day.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        {/* ---------- Hero: asymmetric text + portrait ---------- */}
        <section className="grid grid-cols-1 items-center gap-10 text-center lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Our story
            </p>
            <h1 className="font-heading mt-3 text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Every gown begins
              <br />
              with your story.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Blanche Bridal was founded on a simple belief: every bride
              deserves a gown made just for her. Not altered to fit —
              designed and crafted from the first measurement to the final
              stitch, around your body, your style, and your day.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/products"
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Explore collection
              </Link>
              <BookFittingButton className="rounded-full border-2 border-foreground/25 px-6 py-3 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-card" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624459/kandyan-bride_ngl3nq.png"
                alt="A Blanche Bridal gown, hand-fitted for its bride"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Small accent card, echoes the tilt-card motif from the collection */}
            <div className="absolute -bottom-6 -left-6 hidden w-40 rotate-[-4deg] rounded-2xl border-2 border-foreground/15 bg-card p-4 shadow-lg sm:block">
              <p className="font-heading text-2xl font-bold text-primary">15+</p>
              <p className="mt-1 text-xs text-muted-foreground">
                years of bridal craftsmanship
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Process: dark card timeline, echoes Bridal Collection card ---------- */}
        <section className="mt-20 sm:mt-28">
          <div className="rounded-3xl bg-[#1A1A1A] p-6 sm:p-10 dark:bg-card">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
              <p className="max-w-xs text-xs italic leading-relaxed text-[#c9c7c2] sm:text-sm">
                From first sketch to final stitch — how a Blanche gown comes
                to life.
              </p>
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                How it works
              </h2>
            </div>

            <div className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-8">
              {/* connecting line, desktop only */}
              <div
                aria-hidden
                className="absolute top-[0.9rem] left-0 hidden h-px w-full bg-white/15 lg:block"
              />

              {STEPS.map((step) => (
                <div key={step.number} className="relative">
                  <p className="font-heading relative z-10 inline-block bg-[#1A1A1A] pr-3 text-sm font-medium text-primary dark:bg-card">
                    {step.number}
                  </p>
                  <p className="mt-3 text-base font-medium text-white">
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#a8a5a0]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section className="mt-16 text-center sm:mt-20">
          <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
            Ready to begin?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Book a fitting and let's start designing the gown that's made
            for you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <BookFittingButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}