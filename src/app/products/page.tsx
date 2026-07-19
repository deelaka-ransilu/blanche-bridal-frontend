import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { PublicNav } from "@/components/public-nav";
import { ProductsGrid } from "@/components/products/products-grid";
import { SiteFooter } from "@/components/site-footer";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // Dresses are no longer sold through /products — they only appear via
  // /rent (rental browsing) or /custom-design (bespoke). This page is
  // accessories-only now, so `type` is hardcoded rather than read from the
  // URL.
  const [productsResult, categoriesResult, accessoryProbeResult] = await Promise.all([
    getProducts({ categoryId: category, type: "ACCESSORY" }),
    getAllCategories(),
    // Unpaginated, unfiltered-by-category probe — used only to figure out
    // which category ids actually have accessory products in them, since
    // categories don't carry a `type` field of their own. Dress-only
    // categories (Bridal Gowns, Evening Gowns, etc.) get excluded from the
    // sidebar as a result.
    getProducts({ type: "ACCESSORY", size: 500 }),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const allCategories = categoriesResult.success ? categoriesResult.data : [];
  const accessoryProducts = accessoryProbeResult.success ? accessoryProbeResult.data : [];

  const activeCategoryName = category
    ? allCategories.find((c) => c.id === category)?.name
    : null;

  const categoryIdsWithAccessories = new Set(
    accessoryProducts.map((p) => p.category?.id).filter((id): id is string => Boolean(id)),
  );

  const allChildrenByParentId = allCategories.reduce<Record<string, typeof allCategories>>(
    (acc, cat) => {
      if (cat.parentId) {
        acc[cat.parentId] = [...(acc[cat.parentId] ?? []), cat];
      }
      return acc;
    },
    {}
  );

  // Only keep child categories that actually have accessory products.
  const childrenByParentId = Object.fromEntries(
    Object.entries(allChildrenByParentId).map(([parentId, kids]) => [
      parentId,
      kids.filter((k) => categoryIdsWithAccessories.has(k.id)),
    ]),
  );

  // Keep a top-level category if it directly has accessories, or any of
  // its children do.
  const topLevelCategories = allCategories.filter(
    (c) =>
      !c.parentId &&
      (categoryIdsWithAccessories.has(c.id) ||
        (childrenByParentId[c.id]?.length ?? 0) > 0),
  );

  const withParams = (overrides: { category?: string | null }) => {
    const params = new URLSearchParams();
    const nextCategory = overrides.category !== undefined ? overrides.category : category;
    if (nextCategory) params.set("category", nextCategory);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 sm:pt-28">
        {/* ---------- Header ---------- */}
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Blanche Bridal
          </p>
          <h1 className="font-heading mt-2 text-3xl font-medium text-foreground sm:text-4xl">
            Shop accessories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Veils, jewellery, and headpieces to complete your bridal look.
          </p>
        </div>

        {/* ---------- Looking for a gown? banner ---------- */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:mb-14">
          <Link
            href="/rent"
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1A1A1A] transition-transform hover:-translate-y-0.5 dark:bg-card sm:flex-row"
          >
            <div className="relative h-40 w-full flex-shrink-0 sm:h-auto sm:w-40">
              <Image
                src="https://res.cloudinary.com/dexuqaeuf/image/upload/v1784383113/blanche-bridal/products/ikrbazyaq2imfa58ljhi.webp"
                alt="Rent a gown"
                fill
                sizes="(max-width: 640px) 100vw, 160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#c9c7c2]">
                Looking for a gown?
              </p>
              <p className="font-heading mt-1.5 text-xl font-medium text-white sm:text-2xl">
                Rent a gown
              </p>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#a8a5a0] sm:text-sm">
                Stunning dresses for your event, without the commitment of
                buying.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-transform group-hover:translate-x-1">
                Browse rentals →
              </span>
            </div>
          </Link>

          <Link
            href="/custom-design"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-0.5 sm:flex-row"
          >
            <div className="relative h-40 w-full flex-shrink-0 sm:h-auto sm:w-40">
              <Image
                src="https://res.cloudinary.com/dexuqaeuf/image/upload/v1784428863/Fitting_delivery_xugikx.png"
                alt="Design a custom dress"
                fill
                sizes="(max-width: 640px) 100vw, 160px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Dreaming something specific?
              </p>
              <p className="font-heading mt-1.5 text-xl font-medium text-foreground sm:text-2xl">
                Design a custom dress
              </p>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Work with our designers to bring your dream gown to life,
                from sketch to fitting.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-transform group-hover:translate-x-1">
                See the process →
              </span>
            </div>
          </Link>
        </div>

        {/* ---------- Mobile/tablet category strip (top-level only, horizontal scroll) ---------- */}
        {topLevelCategories.length > 0 && (
          <div className="relative mb-6 -mx-6 lg:hidden">
            <div className="overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                <Link
                  href={withParams({ category: null })}
                  className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    !category
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-primary/5"
                  }`}
                >
                  All
                </Link>
                {topLevelCategories.map((top) => {
                  const kids = childrenByParentId[top.id] ?? [];
                  const isActive =
                    category === top.id || kids.some((k) => k.id === category);
                  return (
                    <Link
                      key={top.id}
                      href={withParams({ category: top.id })}
                      className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-primary/5"
                      }`}
                    >
                      {top.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}

        {!productsResult.success && (
          <p className="mb-6 text-sm text-destructive">
            {productsResult.message}
          </p>
        )}

        {/* ---------- Sidebar (desktop) + grid ---------- */}
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {topLevelCategories.length > 0 && (
            <aside className="hidden lg:block">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </p>
              <nav className="flex flex-col gap-1">
                <Link
                  href={withParams({ category: null })}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    !category
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  All accessories
                </Link>

                {topLevelCategories.map((top) => {
                  const kids = childrenByParentId[top.id] ?? [];
                  const isParentActive = category === top.id;
                  const isChildActive = kids.some((k) => k.id === category);

                  if (kids.length === 0) {
                    return (
                      <Link
                        key={top.id}
                        href={withParams({ category: top.id })}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          isParentActive
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        {top.name}
                      </Link>
                    );
                  }

                  return (
                    <details
                      key={top.id}
                      open={isParentActive || isChildActive}
                      className="group"
                    >
                      <summary
                        className={`flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors marker:content-none hover:bg-card [&::-webkit-details-marker]:hidden ${
                          isParentActive || isChildActive
                            ? "font-medium text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {top.name}
                        <svg
                          className={`h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90 ${
                            isParentActive || isChildActive
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 6l6 6-6 6"
                          />
                        </svg>
                      </summary>

                      <div className="ml-2 mt-1 flex flex-col gap-1 border-l border-border pl-3">
                        <Link
                          href={withParams({ category: top.id })}
                          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            isParentActive
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          All {top.name}
                        </Link>
                        {kids.map((kid) => (
                          <Link
                            key={kid.id}
                            href={withParams({ category: kid.id })}
                            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                              category === kid.id
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-card hover:text-foreground"
                            }`}
                          >
                            {kid.name}
                          </Link>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </nav>
            </aside>
          )}

          <ProductsGrid
            products={products}
            activeCategoryName={activeCategoryName}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}