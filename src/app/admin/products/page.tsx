import { getAllProductsAdmin, getDeletedProducts } from "@/lib/api/products";
import { getAllCategories, getDeletedCategories } from "@/lib/api/categories";
import { getAllRentals } from "@/lib/api/rentals";
import { getAllGalleryImages } from "@/lib/api/gallery";
import { deleteCategoryAction, restoreCategoryAction } from "@/lib/actions/categories";
import { ProductsPageShell } from "@/components/products/products-page-shell";
import { RentalsPanel } from "@/components/admin/products/rentals-panel";
import { GalleryPanel } from "@/components/admin/products/gallery-panel";
import { Button } from "@/components/ui/button";
import type { RentalStatus } from "@/types/rental";

export default async function AdminProductsPage() {
  const [
    productsResult,
    deletedResult,
    categoriesResult,
    deletedCategoriesResult,
    dressCategoriesResult,
    dressProductsResult,
    activeRentalsResult,
    overdueRentalsResult,
    galleryResult,
  ] = await Promise.all([
    getAllProductsAdmin(),
    getDeletedProducts(),
    getAllCategories(),
    getDeletedCategories(),
    getAllCategories("DRESS"),
    getAllProductsAdmin(0, 200, "DRESS"),
    getAllRentals("ACTIVE"),
    getAllRentals("OVERDUE"),
    getAllGalleryImages(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const deleted = deletedResult.success ? deletedResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const deletedCategories = deletedCategoriesResult.success ? deletedCategoriesResult.data : [];

  const dressCategories = dressCategoriesResult.success ? dressCategoriesResult.data : [];
  const dressProducts = dressProductsResult.success ? dressProductsResult.data : [];

  const galleryImages = galleryResult.success ? galleryResult.data : [];

  // getDeletedProducts() returns ALL deactivated products regardless of
  // type, so split it here: dress-category items go to the Rentals tab's
  // Deactivated list, everything else goes to Catalog's.
  const dressCategoryIds = new Set(dressCategories.map((c) => c.id));
  const deletedDressProducts = deleted.filter((p) => p.category && dressCategoryIds.has(p.category.id));
  const deletedAccessoryProducts = deleted.filter((p) => !p.category || !dressCategoryIds.has(p.category.id));

  const rentalStatusMap: Record<string, Extract<RentalStatus, "ACTIVE" | "OVERDUE">> = {};
  if (activeRentalsResult.success) {
    for (const r of activeRentalsResult.data) {
      if (r.productId) rentalStatusMap[r.productId] = "ACTIVE";
    }
  }
  if (overdueRentalsResult.success) {
    for (const r of overdueRentalsResult.data) {
      if (r.productId) rentalStatusMap[r.productId] = "OVERDUE";
    }
  }

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

  const rentalsContent = (
    <RentalsPanel
      dressCategories={dressCategories}
      dressProducts={dressProducts}
      deletedDressProducts={deletedDressProducts}
      rentalStatusMap={rentalStatusMap}
      loadError={!dressProductsResult.success ? dressProductsResult.message : undefined}
    />
  );

  const galleryContent = <GalleryPanel images={galleryImages} />;

  return (
    <div className="mx-auto max-w-4xl">
      <ProductsPageShell
        products={products}
        deleted={deletedAccessoryProducts}
        categories={categories}
        loadError={!productsResult.success ? productsResult.message : undefined}
        categoriesContent={categoriesContent}
        rentalsContent={rentalsContent}
        galleryContent={galleryContent}
      />
    </div>
  );
}