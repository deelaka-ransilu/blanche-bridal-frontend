import Link from "next/link";
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

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ categoryId: category }),
    getAllCategories(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  const activeCategoryName = category
    ? categories.find((c) => c.id === category)?.name
    : null;

  // Build a parent -> children tree from the flat list.
  const topLevelCategories = categories.filter((c) => !c.parentId);
  const childrenByParentId = categories.reduce<Record<string, typeof categories>>(
    (acc, cat) => {
      if (cat.parentId) {
        acc[cat.parentId] = [...(acc[cat.parentId] ?? []), cat];
      }
      return acc;
    },
    {}
  );

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
            Our collection
          </h1>
        </div>

        {/* ---------- Mobile/tablet category strip (top-level only, horizontal scroll) ---------- */}
        {categories.length > 0 && (
          <div className="relative mb-6 -mx-6 lg:hidden">
            <div className="overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                <Link
                  href="/products"
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
                      href={`/products?category=${top.id}`}
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
            {/* Fade hint that the strip scrolls */}
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
          {categories.length > 0 && (
            <aside className="hidden lg:block">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </p>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/products"
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    !category
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  All pieces
                </Link>

                {topLevelCategories.map((top) => {
                  const kids = childrenByParentId[top.id] ?? [];
                  const isParentActive = category === top.id;
                  const isChildActive = kids.some((k) => k.id === category);

                  if (kids.length === 0) {
                    return (
                      <Link
                        key={top.id}
                        href={`/products?category=${top.id}`}
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
                          href={`/products?category=${top.id}`}
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
                            href={`/products?category=${kid.id}`}
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