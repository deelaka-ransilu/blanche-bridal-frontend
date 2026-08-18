import { PublicNav } from "@/components/layout/public-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { CustomDesignProcess } from "@/components/home/custom-design-process";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { SmoothScroll } from "@/components/effects/smooth-scroll";

export default function CustomDesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <SmoothScroll>
        <main className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-28 space-y-16 sm:space-y-24">
          {/* ---------- Gallery teaser — compact, horizontal scroll on mobile ---------- */}
          <section id="gallery" className="scroll-mt-24">
            <GalleryTeaser />
          </section>

          {/* ---------- Process (dark card) — now leads, explains the offer ---------- */}
          <section className="scroll-mt-24">
            <CustomDesignProcess />
          </section>
        </main>

        <SiteFooter />
      </SmoothScroll>
    </div>
  );
}