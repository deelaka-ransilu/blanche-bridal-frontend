import Image from "next/image";
import { CustomDesignButton } from "@/components/custom-design-button";

const STEPS = [
  {
    number: "01",
    title: "Consultation",
    description: "Share your vision, occasion, and inspiration with our design team.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784428866/Consultation_ikedcn.png",
  },
  {
    number: "02",
    title: "Fabric & style",
    description: "Choose from our curated laces, silks, and embellishments.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784428868/Fabric_style_o9askw.png",
  },
  {
    number: "03",
    title: "Cutting & stitching",
    description: "Our artisans hand-cut and stitch every detail to your measurements.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784428861/Cutting_stitching_qyzalz.png",
  },
  {
    number: "04",
    title: "Fitting",
    description: "Final fittings ensure a perfect silhouette before your big day.",
    src: "https://res.cloudinary.com/dexuqaeuf/image/upload/v1784428863/Fitting_delivery_xugikx.png",
  },
];

export function CustomDesignProcess() {
  return (
    <div className="rounded-3xl bg-[#1A1A1A] p-4 dark:bg-card sm:p-7">
      <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-10">
        <p className="anim-fade-up text-xs font-medium uppercase tracking-[0.2em] text-[#c9c7c2]">
          Made for you
        </p>
        <h2 className="split-rise font-heading text-2xl font-bold text-white sm:text-4xl">
          Your custom gown, start to finish
        </h2>
        <p className="anim-fade-up mt-1 max-w-md text-xs italic leading-relaxed text-[#c9c7c2] sm:text-base">
          From first sketch to final stitch, every custom design is crafted
          around you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className={`flex flex-col ${
              i % 2 === 0 ? "anim-fade-left" : "anim-fade-right"
            }`}
          >
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-[#3a3733] sm:h-64 sm:rounded-2xl">
              <Image
                src={step.src}
                alt={step.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-medium text-primary-foreground sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {step.number}
              </span>
            </div>
            <h3 className="font-heading mt-2 text-sm font-medium text-white sm:mt-3 sm:text-base">
              {step.title}
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-[#c9c7c2] sm:text-sm sm:leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="anim-fade-up mt-6 flex justify-center sm:mt-10">
        <CustomDesignButton className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" />
      </div>
    </div>
  );
}