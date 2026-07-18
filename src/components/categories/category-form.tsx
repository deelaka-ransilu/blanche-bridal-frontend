"use client";

import { useActionState, useEffect } from "react";
import { createCategoryAction, type CategoryFormState } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import type { ProductCategory } from "@/types/product";
import type { CategoryType } from "@/types/category";

export function CategoryForm({
  categories,
  type,
  onSuccess,
}: {
  categories: ProductCategory[];
  // Fixed per context, not user-chosen — Catalog always creates ACCESSORY
  // categories, Rentals always creates DRESS categories.
  type: CategoryType;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Name</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Bridal Gowns"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Slug</label>
        <input
          type="text"
          name="slug"
          placeholder="bridal-gowns"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Parent</label>
        <select
          name="parentId"
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">No parent</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {state && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}

      <Button type="submit" className="w-full">
        Add Category
      </Button>
    </form>
  );
}