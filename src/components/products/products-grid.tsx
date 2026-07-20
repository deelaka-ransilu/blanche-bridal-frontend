"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  firstImageUrl?: string | null;
  purchasePrice?: number | null;
  rentalPrice?: number | null;
  category?: { name: string } | null;
}

interface ProductsGridProps {
  products: Product[];
  activeCategoryName?: string | null;
}

export function ProductsGrid({
  products,
  activeCategoryName,
}: ProductsGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div>
      {/* Search */}
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Search
      </p>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the collection..."
          className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <p className="mb-5 mt-3 border-b border-border pb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
        {activeCategoryName ? ` in ${activeCategoryName}` : ""}
        {query ? ` matching "${query}"` : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => {
          const priceLabel =
            product.purchasePrice != null
              ? `Rs ${product.purchasePrice.toLocaleString("en-LK")}`
              : product.rentalPrice != null
                ? `Rs ${product.rentalPrice.toLocaleString("en-LK")} / rental`
                : "Price on inquiry";

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary/8">
                {product.firstImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.firstImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Image coming soon
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                  {product.category?.name ?? "Uncategorized"}
                </p>
                <p className="font-heading mt-1 text-base font-medium text-foreground">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {priceLabel}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">
            {query
              ? `Nothing matches "${query}".`
              : activeCategoryName
                ? `No pieces in ${activeCategoryName} just yet.`
                : "No pieces found."}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}