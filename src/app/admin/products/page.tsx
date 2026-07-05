import Link from "next/link";
import { getAllProductsAdmin, getDeletedProducts } from "@/lib/api/products";
import { getAllCategories } from "@/lib/api/categories";
import { deleteProductAction, restoreProductAction } from "@/lib/actions/products";
import { ProductForm } from "@/components/products/product-form";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const [productsResult, deletedResult, categoriesResult] = await Promise.all([
    getAllProductsAdmin(),
    getDeletedProducts(),
    getAllCategories(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const deleted = deletedResult.success ? deletedResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Products</h1>

      <ProductForm categories={categories} />

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
              <p className="text-sm text-muted-foreground">
                {p.category?.name ?? "Uncategorized"} · Stock: {p.stock} ·{" "}
                {p.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/products/${p.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-primary/5"
              >
                Edit
              </Link>
              <form action={deleteProductAction.bind(null, p.id)}>
                <Button type="submit" size="sm" variant="outline">Deactivate</Button>
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
                  <Button type="submit" size="sm">Restore</Button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}