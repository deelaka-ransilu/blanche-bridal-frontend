import Link from "next/link";
import { PublicNav } from "@/components/layout/public-nav";
import { BridalCarousel } from "@/components/home/bridal-carousel";
import { CustomDesignProcess } from "@/components/home/custom-design-process";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductTeaserSection } from "@/components/products/product-teaser-section";
import { RentalFeatureSection } from "@/components/rentals/rental-feature-section";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { ScrollAnimations } from "@/components/effects/scroll-animations";
import { HeroRotatingImage } from "@/components/home/hero-rotating-image";
import { BookFittingButton } from "@/components/rentals/book-fitting-button";
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNav />
      <ScrollAnimations />

      <SmoothScroll>
        <main>
          <div className="mx-auto max-w-6xl px-6 pb-10">
            {/* ---------- Hero ---------- */}
            <section className="flex flex-col justify-center px-4 pt-32 pb-20 lg:px-0 lg:pt-40 lg:pb-28">
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
                    <Link
                      href="/products"
                      className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary/25"
                    >
                      Buy
                    </Link>
                    <Link
                      href="/rent"
                      className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary/25"
                    >
                      Rent
                    </Link>
                    <Link
                      href="/my/custom-design/new"
                      className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary transition hover:bg-primary/25"
                    >
                      Design
                    </Link>
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
            <section className="py-16 sm:py-20">
              <CustomDesignProcess />
            </section>

            {/* ---------- Bridal collection ---------- */}
            <section className="py-16 sm:py-20">
              <BridalCarousel />
            </section>

            {/* ---------- Gallery teaser ---------- */}
            <section className="py-16 sm:py-20">
              <GalleryTeaser />
            </section>

            {/* ---------- Rent + Accessories ---------- */}
            {(rentalDresses.length > 0 || accessories.length > 0) && (
              <section className="py-16 sm:py-20">
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

            {/* ---------- FAQ ---------- */}
            <section className="py-16 sm:py-20">
              <div className="mb-8 text-center sm:mb-10">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Good to know
                </p>
                <h2 className="font-heading mt-1 text-2xl font-medium text-foreground sm:text-3xl">
                  Frequently asked questions
                </h2>
              </div>
              <div className="mx-auto max-w-2xl">
                <FaqAccordion />
              </div>
            </section>

            {/* ---------- Final CTA banner ---------- */}
            <section className="mb-6 rounded-3xl bg-[#1A1A1A] px-6 py-14 text-center dark:bg-card sm:mb-10 sm:py-16">
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Ready to say yes to the dress?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#c9c7c2] sm:text-base">
                Book a fitting, start a custom design, or browse the collection today.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <BookFittingButton className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90" />
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/25 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Browse the collection
                </Link>
              </div>
            </section>
          </div>
        </main>

        <SiteFooter />
      </SmoothScroll>
    </div>
  );
}