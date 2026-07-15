"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { AdminProductsTabs } from "@/components/admin/admin-products-tabs";
import { ProductsListClient } from "@/components/products/products-list-client";
import { NewCategoryTrigger } from "@/components/categories/new-category-trigger";
import { Button } from "@/components/ui/button";
import type { Product, ProductCategory } from "@/types/product";

export function ProductsPageShell({
  products,
  deleted,
  categories,
  loadError,
  categoriesContent,
}: {
  products: Product[];
  deleted: Product[];
  categories: ProductCategory[];
  loadError?: string;
  categoriesContent: ReactNode;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <AdminProductsTabs
      productsCount={products.length}
      categoriesCount={categories.length}
      productTrigger={
        <Button type="button" onClick={() => setShowForm(true)} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          New product
        </Button>
      }
      categoryTrigger={<NewCategoryTrigger categories={categories} />}
      productsContent={
        <ProductsListClient
          products={products}
          deleted={deleted}
          categories={categories}
          loadError={loadError}
          showForm={showForm}
          onShowFormChange={setShowForm}
        />
      }
      categoriesContent={categoriesContent}
    />
  );
}