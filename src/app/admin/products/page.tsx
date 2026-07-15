import { getAllProductsAdmin, getDeletedProducts } from "@/lib/api/products";
import { getAllCategories, getDeletedCategories } from "@/lib/api/categories";
import { deleteCategoryAction, restoreCategoryAction } from "@/lib/actions/categories";
import { ProductsPageShell } from "@/components/products/products-page-shell";
import { Button } from "@/components/ui/button";

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

  const categoriesContent = (
    <div className="space-y-5">
      {!categoriesResult.success && (
        <p className="text-sm text-destructive">{categoriesResult.message}</p>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-2xl border border-border p-4"
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
        <details className="rounded-2xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Deactivated ({deletedCategories.length})
          </summary>
          <div className="mt-3 space-y-2">
            {deletedCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-2xl border border-border p-4 opacity-70"
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
      <ProductsPageShell
        products={products}
        deleted={deleted}
        categories={categories}
        loadError={!productsResult.success ? productsResult.message : undefined}
        categoriesContent={categoriesContent}
      />
    </div>
  );
}