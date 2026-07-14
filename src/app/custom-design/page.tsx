import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { CustomDesignButton } from "@/components/custom-design-button";
import { CustomDesignProcess } from "@/components/custom-design-process";
import { GalleryTeaser } from "@/components/gallery-teaser";

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
            Custom design
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            How your own custom design comes together, from first sketch to
            final stitch.
          </p>
        </div>

        {/* ---------- Gallery teaser (3 of 5, links out to /gallery) ---------- */}
        <div className="mb-16 sm:mb-20">
          <GalleryTeaser />
        </div>

        {/* ---------- Process (dark card, same style as landing page) ---------- */}
        <section>
          <CustomDesignProcess />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}