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
    <div className="rounded-3xl bg-[#1A1A1A] p-5 dark:bg-card sm:p-7">
      <div className="mb-8 flex flex-col items-center gap-2 text-center sm:mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9c7c2]">
          Made for you
        </p>
        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Your custom gown, start to finish
        </h2>
        <p className="mt-1 max-w-md text-sm italic leading-relaxed text-[#c9c7c2] sm:text-base">
          From first sketch to final stitch, every custom design is crafted
          around you.
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
  );
}