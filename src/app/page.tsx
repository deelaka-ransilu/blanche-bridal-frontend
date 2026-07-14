import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { BridalCarousel } from "@/components/bridal-carousel";
import { CustomDesignProcess } from "@/components/custom-design-process";
import { SiteFooter } from "@/components/site-footer";
import { ProductTeaserSection } from "@/components/products/product-teaser-section";
import { RentalFeatureSection } from "@/components/rentals/rental-feature-section";
import { BookFittingButton } from "@/components/book-fitting-button";
import { RotatingWord } from "@/components/rotating-word";
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

      <main className="h-screen snap-y snap-proximity overflow-y-scroll scroll-smooth">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          {/* ---------- Hero ---------- */}
          <section className="flex min-h-screen snap-start flex-col justify-center pt-20 sm:pt-24">
            <div className="grid grid-cols-1 items-start gap-10 text-center lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:text-left">
              <div className="flex flex-col items-center lg:items-start">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Premier bridal boutique
                </p>
                <h1 className="font-heading mt-3 text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                  Find your dream
                  <br />
                  gown, made for you.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  A curated bridal experience for gowns, fittings, rentals, and
                  unforgettable wedding moments <RotatingWord /> something
                  entirely your own.
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
                <div className="absolute -bottom-6 -left-6 hidden w-40 rotate-[-4deg] rounded-2xl border-2 border-foreground/15 bg-card p-4 shadow-lg sm:block">
                  <p className="font-heading text-2xl font-bold text-primary">15+</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    years of bridal craftsmanship
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Bridal collection ---------- */}
          <section className="flex min-h-screen snap-start flex-col justify-center py-10">
            <BridalCarousel />
          </section>

          {/* ---------- Rent + Accessories ---------- */}
          {(rentalDresses.length > 0 || accessories.length > 0) && (
            <section className="flex min-h-screen snap-start flex-col justify-center py-10">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {rentalDresses.length > 0 && (
                  <div id="rentals" className="scroll-mt-24">
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

                {accessories.length > 0 && (
                  <ProductTeaserSection
                    eyebrow="The finishing touch"
                    title="Shop Accessories"
                    blurb="Veils, jewellery, and headpieces to complete your bridal look, yours to keep forever."
                    viewAllHref="/products?type=ACCESSORY"
                    ctaLabel="Shop all accessories"
                    products={accessories}
                  />
                )}
              </div>
            </section>
          )}

          {/* ---------- Custom design process ---------- */}
          <section className="flex min-h-screen snap-start flex-col justify-center py-10">
            <CustomDesignProcess />
          </section>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}