"use client";

import { useMemo, useState, useEffect } from "react";
import { deleteCategoryAction } from "@/lib/actions/categories";
import { NewCategoryTrigger } from "@/components/categories/new-category-trigger";
import { getProductByIdAction, deleteProductAction, restoreProductAction } from "@/lib/actions/products";
import { RentalProductForm } from "./rental-product-form";
import { Button } from "@/components/ui/button";
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

type RentalsSubTab = "items" | "categories" | "deactivated";

export function RentalsPanel({
  dressCategories,
  dressProducts,
  deletedDressProducts,
  rentalStatusMap,
  loadError,
}: {
  dressCategories: Category[];
  dressProducts: Product[];
  deletedDressProducts: Product[];
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
          <button
            onClick={() => setSubTab("deactivated")}
            className={[
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              subTab === "deactivated" ? "bg-background shadow-sm font-medium" : "text-muted-foreground",
            ].join(" ")}
          >
            Deactivated · {deletedDressProducts.length}
          </button>
        </div>

        {subTab === "items" ? (
          <Button onClick={openNew}>
            + New rental item
          </Button>
        ) : subTab === "categories" ? (
          <NewCategoryTrigger categories={dressCategories} type="DRESS" />
        ) : null}
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
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none sm:w-64"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No rental items match this filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const status = statusFor(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {item.category?.name ?? "Uncategorized"}
                        </span>
                        {item.rentalPrice != null && (
                          <>
                            <span className="text-border">·</span>
                            <span className="text-xs text-muted-foreground">
                              Rs {item.rentalPrice.toLocaleString()} flat
                            </span>
                          </>
                        )}
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                            STATUS_STYLES[status],
                          ].join(" ")}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item.id)}
                        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Edit
                      </button>
                      <form action={deleteProductAction.bind(null, item.id)}>
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/5"
                        >
                          Deactivate
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {subTab === "categories" && (
        <div className="space-y-2">
          {dressCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div>
                <p className="font-medium text-foreground">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  /{cat.slug}
                  {cat.parentName ? ` · under ${cat.parentName}` : ""}
                </p>
              </div>
              <form action={deleteCategoryAction.bind(null, cat.id)}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  Deactivate
                </Button>
              </form>
            </div>
          ))}
          {dressCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">No dress categories yet.</p>
          )}
        </div>
      )}

      {subTab === "deactivated" && (
        <div className="space-y-2">
          {deletedDressProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deactivated rental items.</p>
          ) : (
            deletedDressProducts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-border p-4 opacity-70"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category?.name ?? "Uncategorized"}
                  </p>
                </div>
                <form action={restoreProductAction.bind(null, item.id)}>
                  <Button type="submit" size="sm">
                    Restore
                  </Button>
                </form>
              </div>
            ))
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