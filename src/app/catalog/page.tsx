"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Category, ProductFilters, ProductSummary } from "@/types";
import { getCategories, getProducts } from "@/lib/api/products";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { CatalogFilters } from "@/features/products/components/CatalogFilters";
import { PublicNav } from "@/components/shared/PublicNav";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

const PAGE_SIZE = 20;

// ── Inner component — uses useSearchParams so must be inside Suspense ─────────
function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const filtersFromUrl = (): ProductFilters => ({
    type: (searchParams.get("type") as ProductFilters["type"]) ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    available: searchParams.get("available") === "true" ? true : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    size: PAGE_SIZE,
  });

  const [filters, setFilters] = useState<ProductFilters>(filtersFromUrl);

  function pushToUrl(f: ProductFilters) {
    const params = new URLSearchParams();
    if (f.type) params.set("type", f.type);
    if (f.categoryId) params.set("categoryId", f.categoryId);
    if (f.search) params.set("search", f.search);
    if (f.minPrice != null) params.set("minPrice", String(f.minPrice));
    if (f.maxPrice != null) params.set("maxPrice", String(f.maxPrice));
    if (f.available) params.set("available", "true");
    if (f.page) params.set("page", String(f.page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleFiltersChange(newFilters: ProductFilters) {
    const updated = { ...newFilters, size: PAGE_SIZE };
    setFilters(updated);
    pushToUrl(updated);
  }

  function handlePageChange(page: number) {
    handleFiltersChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(filters)
      .then((res) => {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const currentPage = filters.page ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared nav */}
      <PublicNav />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page heading + mobile filter button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Our Collection
            </h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                {totalItems} {totalItems === 1 ? "item" : "items"} found
              </p>
            )}
          </div>
          <button
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <HugeiconsIcon icon={FilterIcon} className="size-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl border p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Filters
              </p>
              <CatalogFilters
                categories={categories}
                filters={filters}
                onChange={handleFiltersChange}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className={
                      i === currentPage
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : ""
                    }
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-72 h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-semibold text-gray-900">Filters</p>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CatalogFilters
                categories={categories}
                filters={filters}
                onChange={handleFiltersChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Outer page — wraps content in Suspense to satisfy Next.js build ───────────
export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading collection...</p>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
