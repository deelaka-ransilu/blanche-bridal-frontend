"use client";

import { useMemo, useState, useEffect } from "react";
import { deleteCategoryAction } from "@/lib/actions/categories";
import { NewCategoryTrigger } from "@/components/categories/new-category-trigger";
import { getProductByIdAction } from "@/lib/actions/products";
import { RentalProductForm } from "./rental-product-form";
import type { Category } from "@/types/category";
import type { Product, ProductDetail } from "@/types/product";
import type { RentalStatus } from "@/types/rental";

type DisplayStatus = "AVAILABLE" | "ACTIVE" | "OVERDUE";

const STATUS_STYLES: Record<DisplayStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<DisplayStatus, string> = {
  AVAILABLE: "Available",
  ACTIVE: "Currently rented",
  OVERDUE: "Overdue",
};

const STATUS_FILTERS: { key: DisplayStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AVAILABLE", label: "Available" },
  { key: "ACTIVE", label: "Rented" },
  { key: "OVERDUE", label: "Overdue" },
];

type RentalsSubTab = "items" | "categories";

export function RentalsPanel({
  dressCategories,
  dressProducts,
  rentalStatusMap,
  loadError,
}: {
  dressCategories: Category[];
  dressProducts: Product[];
  rentalStatusMap: Record<string, Extract<RentalStatus, "ACTIVE" | "OVERDUE">>;
  loadError?: string;
}) {
  const [subTab, setSubTab] = useState<RentalsSubTab>("items");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  function statusFor(id: string): DisplayStatus {
    return rentalStatusMap[id] ?? "AVAILABLE";
  }

  const filtered = useMemo(() => {
    return dressProducts.filter((item) => {
      const status = statusFor(item.id);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesQuery =
        query.trim() === "" ||
        item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        (item.category?.name.toLowerCase().includes(query.trim().toLowerCase()) ?? false);
      return matchesStatus && matchesQuery;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dressProducts, statusFilter, query, rentalStatusMap]);

  async function openNew() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  async function openEdit(id: string) {
    setEditingLoading(true);
    setFormOpen(true);
    const result = await getProductByIdAction(id);
    setEditingLoading(false);
    if (result.success) {
      setEditingProduct(result.data);
    } else {
      // Close the form rather than show a broken edit screen — the list
      // itself still has the item, so the user can retry.
      setFormOpen(false);
      console.error(`[RentalsPanel] Failed to load product ${id}: ${result.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-muted p-1">
          <button
            onClick={() => setSubTab("items")}
            className={[
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              subTab === "items" ? "bg-background shadow-sm font-medium" : "text-muted-foreground",
            ].join(" ")}
          >
            Rentals · {dressProducts.length}
          </button>
          <button
            onClick={() => setSubTab("categories")}
            className={[
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              subTab === "categories" ? "bg-background shadow-sm font-medium" : "text-muted-foreground",
            ].join(" ")}
          >
            Categories · {dressCategories.length}
          </button>
        </div>

        {subTab === "items" ? (
          <button
            onClick={openNew}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            New rental item
          </button>
        ) : (
          <NewCategoryTrigger categories={dressCategories} type="DRESS" />
        )}
      </div>

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      {subTab === "items" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex flex-wrap gap-1 rounded-full bg-muted p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={[
                    "px-3 py-1.5 text-xs rounded-full transition-colors",
                    statusFilter === filter.key
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category"
              className="w-full rounded-md border px-3 py-2 text-sm sm:w-64"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No rental items match this filter.
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((item) => {
                const status = statusFor(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-muted" />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category?.name ?? "Uncategorized"}
                          {item.rentalPrice != null &&
                            ` · Rs ${item.rentalPrice.toLocaleString()} flat`}
                          {/* rentalPricePerDay not shown — not present on
                              ProductSummaryResponse yet, see note above. */}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={["rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[status]].join(" ")}>
                        {STATUS_LABEL[status]}
                      </span>
                      <button onClick={() => openEdit(item.id)} className="text-sm text-primary">
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {subTab === "categories" && (
        <div className="grid gap-3">
          {dressCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  /{cat.slug}
                  {cat.parentName ? ` · under ${cat.parentName}` : ""}
                </p>
              </div>
              <form action={deleteCategoryAction.bind(null, cat.id)}>
                <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium">
                  Deactivate
                </button>
              </form>
            </div>
          ))}
          {dressCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">No dress categories yet.</p>
          )}
        </div>
      )}

      {formOpen && !editingLoading && (
        <RentalProductForm
          product={editingProduct ?? undefined}
          categories={dressCategories}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}