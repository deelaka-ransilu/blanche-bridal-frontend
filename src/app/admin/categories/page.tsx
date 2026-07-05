import { getAllCategories, getDeletedCategories } from "@/lib/api/categories";
import { deleteCategoryAction, restoreCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/categories/category-form";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const [result, deletedResult] = await Promise.all([
    getAllCategories(),
    getDeletedCategories(),
  ]);

  const categories = result.success ? result.data : [];
  const deletedCategories = deletedResult.success ? deletedResult.data : [];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-medium text-foreground">Categories</h1>

      <CategoryForm categories={categories} />

      {!result.success && <p className="text-sm text-destructive">{result.message}</p>}

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
}