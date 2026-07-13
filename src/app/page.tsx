import { PublicNav } from "@/components/public-nav";
import { BridalCarousel } from "@/components/bridal-carousel";
import { CustomDesignProcess } from "@/components/custom-design-process";
import { SiteFooter } from "@/components/site-footer";
import { ProductTeaserSection } from "@/components/products/product-teaser-section";
import { getProducts } from "@/lib/api/products";

export default async function LandingPage() {
  // NOTE: getProducts()/ProductQuery has no `sort` param today — "latest N"
  // here just means "first N in whatever default order the backend
  // returns" (page 0, size 4). Confirmed via ProductController.getAll that
  // the backend defaults to sort=createdAt,desc when no sort param is
  // passed, so this correctly reflects the 4 most recently created products.
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

        {/* ---------- Teaser: Rent for Your Event ---------- */}
        {rentalDresses.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <ProductTeaserSection
              eyebrow="For your big day"
              title="Rent for Your Event"
              blurb="Stunning gowns for every occasion, without the commitment of buying. Wear it once, return it after."
              viewAllHref="/products?type=DRESS"
              ctaLabel="Browse all rentals"
              products={rentalDresses}
            />
          </section>
        )}

        {/* ---------- Teaser: Shop Accessories ---------- */}
        {accessories.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <ProductTeaserSection
              eyebrow="The finishing touch"
              title="Shop Accessories"
              blurb="Veils, jewellery, and headpieces to complete your bridal look, yours to keep forever."
              viewAllHref="/products?type=ACCESSORY"
              ctaLabel="Shop all accessories"
              products={accessories}
            />
          </section>
        )}

        {/* ---------- Bottom tier: custom design process ---------- */}
        <section className="mt-10 sm:mt-12">
          <CustomDesignProcess />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}