"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { AdminProductsTabs } from "@/components/admin/admin-products-tabs";
import { ProductsListClient } from "@/components/products/products-list-client";
import { NewCategoryTrigger } from "@/components/categories/new-category-trigger";
import { Button } from "@/components/ui/button";
import { restoreProductAction } from "@/lib/actions/products";
import type { Product, ProductCategory } from "@/types/product";

export function ProductsPageShell({
  products,
  deleted,
  categories,
  loadError,
  categoriesContent,
  rentalsContent,
  galleryContent,
}: {
  products: Product[];
  deleted: Product[];
  categories: ProductCategory[];
  loadError?: string;
  categoriesContent: ReactNode;
  rentalsContent: ReactNode;
  galleryContent: ReactNode;
}) {
  const [showForm, setShowForm] = useState(false);

  const deactivatedContent = (
    <div className="space-y-2">
      {deleted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No deactivated products.</p>
      ) : (
        deleted.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-2xl border border-border p-4 opacity-70"
          >
            <div>
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.category?.name ?? "Uncategorized"}
              </p>
            </div>
            <form action={restoreProductAction.bind(null, p.id)}>
              <Button type="submit" size="sm">
                Restore
              </Button>
            </form>
          </div>
        ))
      )}
    </div>
  );

  return (
    <AdminProductsTabs
      productsCount={products.length}
      categoriesCount={categories.length}
      deactivatedCount={deleted.length}
      productTrigger={
        <Button type="button" onClick={() => setShowForm(true)} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          New product
        </Button>
      }
      categoryTrigger={
        <NewCategoryTrigger categories={categories} type="ACCESSORY" />
      }
      productsContent={
        <ProductsListClient
          products={products}
          categories={categories}
          loadError={loadError}
          showForm={showForm}
          onShowFormChange={setShowForm}
        />
      }
      categoriesContent={categoriesContent}
      deactivatedContent={deactivatedContent}
      rentalsContent={rentalsContent}
      galleryContent={galleryContent}
    />
  );
}