import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { BridalCarousel } from "@/components/bridal-carousel";
import { CustomDesignProcess } from "@/components/custom-design-process";
import { SiteFooter } from "@/components/site-footer";
import { ProductTeaserSection } from "@/components/products/product-teaser-section";
import { RentalFeatureSection } from "@/components/rentals/rental-feature-section";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollAnimations } from "@/components/scroll-animations";
import { HeroRotatingImage } from "@/components/hero-rotating-image";
import { getProducts } from "@/lib/api/products";

export default async function LandingPage() {
  const [accessoriesResult, rentalsResult] = await Promise.all([
    getProducts({ type: "ACCESSORY", size: 4 }),
    getProducts({ type: "DRESS", size: 4 }),
  ]);

  const accessories = accessoriesResult.success ? accessoriesResult.data : [];
  const rentalDresses = rentalsResult.success
    ? rentalsResult.data.filter((p) => p.rentalPrice != null)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <ScrollAnimations />

      <SmoothScroll>
        <main>
          <div className="mx-auto max-w-6xl px-6 pb-10">
            {/* ---------- Hero ---------- */}
            <section
              data-snap
              className="flex min-h-screen flex-col justify-center px-4 pt-24 pb-16 lg:h-screen lg:px-0 lg:pt-0 lg:pb-0"
            >
              <div className="grid grid-cols-1 items-center gap-10 text-center lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:text-left">
                <div className="flex flex-col items-center lg:items-start">
                  <p className="anim-fade-up text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Premier bridal boutique
                  </p>
                  <h1 className="split-rise animate-gentle-glow font-heading mt-3 text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                    Find your dream
                    <br />
                    gown, made for you.
                  </h1>

                  <div className="anim-fade-up mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                      Buy
                    </span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                      Rent
                    </span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                      Design
                    </span>
                  </div>
                  <p className="anim-fade-up mt-3 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                    something entirely your own.
                  </p>

                  <div className="anim-fade-up mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                    <Link
                      href="/gallery"
                      className="inline-flex items-center justify-center leading-none rounded-full border-2 border-primary bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Explore collection
                    </Link>
                    <Link
                      href="/my/custom-design/new"
                      className="inline-flex items-center justify-center leading-none rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-bold text-primary transition hover:bg-primary/10"
                    >
                      Design a custom dress
                    </Link>
                  </div>
                </div>

                <div className="anim-scale-in relative mx-auto w-full max-w-sm">
                  <HeroRotatingImage />
                  <div className="absolute -bottom-4 -left-4 w-32 rotate-[-4deg] rounded-2xl border-2 border-foreground/15 bg-card p-3 shadow-lg sm:-bottom-6 sm:-left-6 sm:w-40 sm:p-4">
                    <p className="font-heading text-xl font-bold text-primary sm:text-2xl">15+</p>
                    <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                      years of bridal craftsmanship
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ---------- Custom design process ---------- */}
            <section
              data-snap
              className="flex min-h-screen flex-col justify-center px-4 py-16 lg:h-screen lg:px-0 lg:py-10"
            >
              <CustomDesignProcess />
            </section>

            {/* ---------- Bridal collection ---------- */}
            <section data-snap className="flex h-screen flex-col justify-center py-10">
              <BridalCarousel />
            </section>

            {/* ---------- Rent + Accessories ---------- */}
            {(rentalDresses.length > 0 || accessories.length > 0) && (
              <section data-snap className="flex h-screen flex-col justify-center py-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {accessories.length > 0 && (
                    <div className="anim-fade-left">
                      <ProductTeaserSection
                        eyebrow="The finishing touch"
                        title="Shop Accessories"
                        blurb="Veils, jewellery, and headpieces to complete your bridal look, yours to keep forever."
                        viewAllHref="/products?type=ACCESSORY"
                        ctaLabel="Shop all accessories"
                        products={accessories}
                      />
                    </div>
                  )}

                  {rentalDresses.length > 0 && (
                    <div id="rentals" className="anim-fade-right scroll-mt-24">
                      <RentalFeatureSection
                        eyebrow="For your big day"
                        title="Rent for Your Event"
                        blurb="Stunning gowns for every occasion, without the commitment of buying. Wear it once, return it after."
                        viewAllHref="/products?type=DRESS"
                        ctaLabel="Browse all rentals"
                        products={rentalDresses}
                      />
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </SmoothScroll>
    </div>
  );
}