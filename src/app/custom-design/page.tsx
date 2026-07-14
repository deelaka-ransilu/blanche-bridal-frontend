import Image from "next/image";
import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { CustomDesignButton } from "@/components/custom-design-button";

const GALLERY_ITEMS = [
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/south-indian-bride_w2m8ym.png",
    caption: "The South Indian bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/low-country-saree-bride_rcn8w0.png",
    caption: "The low-country bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624459/kandyan-bride_ngl3nq.png",
    caption: "The Kandyan bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624460/muslim-bride_vgmtaf.png",
    caption: "The Muslim bride",
  },
  {
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1777624461/western-bride_xxvg2i.png",
    caption: "The Western bride",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Consultation",
    description: "Share your vision, occasion, and inspiration with our design team.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1783956744/Consultation_xhogrx.png",
  },
  {
    number: "02",
    title: "Fabric & style",
    description: "Choose from our curated laces, silks, and embellishments.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1783956744/Fabric_style_srvoo5.png",
  },
  {
    number: "03",
    title: "Cutting & stitching",
    description: "Our artisans hand-cut and stitch every detail to your measurements.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1783956746/Cutting_stitching_j6esa9.png",
  },
  {
    number: "04",
    title: "Fitting & delivery",
    description: "Final fittings ensure a perfect silhouette before your big day.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1783956748/Fitting_delivery_bz58ei.png",
  },
];

export default function CustomDesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        {/* ---------- Header ---------- */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Made for you
          </p>
          <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
            Custom design & gallery
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            A closer look at gowns we&apos;ve brought to life, and how your
            own custom design comes together from first sketch to final
            stitch.
          </p>
        </div>

        {/* ---------- Gallery ---------- */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.caption}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-card"
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-white">
                    {item.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Process (dark card, same style as landing page) ---------- */}
        <section className="mt-16 sm:mt-20">
          <div className="rounded-3xl bg-[#1A1A1A] p-5 dark:bg-card sm:p-7">
            <div className="mb-8 flex flex-col items-center gap-2 text-center sm:mb-10">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9c7c2]">
                How it works
              </p>
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                Your custom gown, start to finish
              </h2>
              <p className="mt-1 max-w-md text-sm italic leading-relaxed text-[#c9c7c2] sm:text-base">
                From first sketch to final stitch, every custom design is
                crafted around you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col">
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-[#3a3733] sm:h-64">
                    <Image
                      src={step.src}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-heading mt-3 text-base font-medium text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#c9c7c2] sm:text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center sm:mt-10">
              <CustomDesignButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
            </div>
          </div>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section className="mt-16 text-center sm:mt-20">
          <h2 className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
            Ready to begin?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Request a consultation call and let&apos;s start designing the
            gown that&apos;s made for you.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <CustomDesignButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}