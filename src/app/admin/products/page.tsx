import Link from "next/link";
import { getAllProductsAdmin, getDeletedProducts } from "@/lib/api/products";
import { getAllCategories, getDeletedCategories } from "@/lib/api/categories";
import { deleteProductAction, restoreProductAction } from "@/lib/actions/products";
import { deleteCategoryAction, restoreCategoryAction } from "@/lib/actions/categories";
import { ProductForm } from "@/components/products/product-form";
import { CategoryForm } from "@/components/categories/category-form";
import { Button } from "@/components/ui/button";
import { AdminProductsTabs } from "@/components/admin/admin-products-tabs";

export default async function AdminProductsPage() {
  const [productsResult, deletedResult, categoriesResult, deletedCategoriesResult] =
    await Promise.all([
      getAllProductsAdmin(),
      getDeletedProducts(),
      getAllCategories(),
      getDeletedCategories(),
    ]);

  const products = productsResult.success ? productsResult.data : [];
  const deleted = deletedResult.success ? deletedResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const deletedCategories = deletedCategoriesResult.success ? deletedCategoriesResult.data : [];

  const productsContent = (
    <div className="space-y-5">
      <details className="group rounded-lg border border-border">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4">
          <span className="font-heading text-base font-medium text-foreground">
            New product
          </span>
          <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="border-t border-border p-4">
          <ProductForm categories={categories} />
        </div>
      </details>

      {!productsResult.success && (
        <p className="text-sm text-destructive">{productsResult.message}</p>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">{p.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{p.category?.name ?? "Uncategorized"}</span>
                <span className="text-border">·</span>
                <span>Stock: {p.stock}</span>
                <span className="text-border">·</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.isAvailable
                      ? "bg-status-completed/10 text-status-completed"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/products/${p.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-primary/5"
              >
                Edit
              </Link>
              <form action={deleteProductAction.bind(null, p.id)}>
                <Button type="submit" size="sm" variant="outline">
                  Deactivate
                </Button>
              </form>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        )}
      </div>

      {deleted.length > 0 && (
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Deactivated ({deleted.length})
          </summary>
          <div className="mt-3 space-y-2">
            {deleted.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 opacity-70"
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
    </div>
  );

  const categoriesContent = (
    <div className="space-y-5">
      <CategoryForm categories={categories} />

      {!categoriesResult.success && (
        <p className="text-sm text-destructive">{categoriesResult.message}</p>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium text-foreground">{cat.name}</p>
              <p className="text-sm text-muted-foreground">
                /{cat.slug}
                {cat.parentName ? ` · under ${cat.parentName}` : ""}
              </p>
            </div>
            <form action={deleteCategoryAction.bind(null, cat.id)}>
              <Button type="submit" size="sm" variant="outline">
                Deactivate
              </Button>
            </form>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>

      {deletedCategories.length > 0 && (
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Deactivated ({deletedCategories.length})
          </summary>
          <div className="mt-3 space-y-2">
            {deletedCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 opacity-70"
              >
                <div>
                  <p className="font-medium text-foreground">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">/{cat.slug}</p>
                </div>
                <form action={restoreCategoryAction.bind(null, cat.id)}>
                  <Button type="submit" size="sm">
                    Restore
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-medium text-foreground">Products</h1>
        <p className="text-[13px] text-muted-foreground">
          {products.length} products · {categories.length} categories
        </p>
      </div>

      <AdminProductsTabs
        productsCount={products.length}
        categoriesCount={categories.length}
        productsContent={productsContent}
        categoriesContent={categoriesContent}
      />
    </div>
  );
}