import { PublicNav } from "@/components/public-nav";
import { SiteFooter } from "@/components/site-footer";
import { CustomDesignProcess } from "@/components/custom-design-process";
import { GalleryTeaser } from "@/components/gallery-teaser";
import { SmoothScroll } from "@/components/smooth-scroll";

export default function CustomDesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <SmoothScroll>
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

            {/* Quick jump for people who want to skip straight to photos */}
            <a
              href="#gallery"
              className="mt-4 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Jump to gallery ↓
            </a>
          </div>

          {/* ---------- Process (dark card) — now leads, explains the offer ---------- */}
          <section className="mb-16 sm:mb-20">
            <CustomDesignProcess />
          </section>

          {/* ---------- Gallery teaser — compact, horizontal scroll on mobile ---------- */}
          <section id="gallery" className="scroll-mt-24">
            <GalleryTeaser />
          </section>
        </main>

        <SiteFooter />
      </SmoothScroll>
    </div>
  );
}