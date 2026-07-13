import { PublicNav } from "@/components/public-nav";
import { BridalCarousel } from "@/components/bridal-carousel";
import { CustomDesignProcess } from "@/components/custom-design-process";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 pb-10 pt-20 sm:pt-24">
        {/* ---------- Top tier: centered light hero ---------- */}
        <section className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Premier Bridal Boutique
          </p>

          <h1 className="font-heading mt-2 text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Find your dream gown
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            A curated bridal experience for gowns, fittings, rentals, and
            unforgettable wedding moments.
          </p>
        </section>

        {/* ---------- Middle tier: dark carousel card ---------- */}
        <section className="mt-14 sm:mt-16 lg:mt-14">
          <BridalCarousel />
        </section>

        {/* ---------- Bottom tier: custom design process ---------- */}
        <section className="mt-10 sm:mt-12">
          <CustomDesignProcess />
        </section>
      </main>
    </div>
  );
}