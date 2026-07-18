"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { deleteProductAction, restoreProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import type { Product, ProductCategory } from "@/types/product";

export function ProductsListClient({
  products,
  deleted,
  categories,
  loadError,
  showForm,
  onShowFormChange,
}: {
  products: Product[];
  deleted: Product[];
  categories: ProductCategory[];
  loadError?: string;
  showForm: boolean;
  onShowFormChange: (show: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="space-y-2">
        {products.map((p) => {
          const isOutOfStock = p.stock <= 0;
          const statusLabel = !p.isAvailable
            ? "Unavailable"
            : isOutOfStock
              ? "Out of stock"
              : "Available";
          const statusDotClass = !p.isAvailable
            ? "bg-muted-foreground"
            : isOutOfStock
              ? "bg-destructive"
              : "bg-status-completed";
          const statusTextClass = !p.isAvailable
            ? "bg-muted text-muted-foreground"
            : isOutOfStock
              ? "bg-destructive/10 text-destructive"
              : "bg-status-completed/10 text-status-completed";

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-border p-4"
            >
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {p.category?.name ?? "Uncategorized"}
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusTextClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
                    {statusLabel}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Edit
                </Link>
                <form action={deleteProductAction.bind(null, p.id)}>
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
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        )}
      </div>

      {deleted.length > 0 && (
        <details className="rounded-2xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Deactivated ({deleted.length})
          </summary>
          <div className="mt-3 space-y-2">
            {deleted.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-border p-4 opacity-70"
              >
                <p className="font-medium text-foreground">{p.name}</p>
                <form action={restoreProductAction.bind(null, p.id)}>
                  <Button type="submit" size="sm">
                    Restore
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => onShowFormChange(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl sm:max-h-[85vh] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="font-heading text-base font-medium text-foreground sm:text-lg">
                New product
              </h2>
              <button
                type="button"
                onClick={() => onShowFormChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ProductForm categories={categories} embedded />
          </div>
        </div>
      )}
    </div>
  );
}