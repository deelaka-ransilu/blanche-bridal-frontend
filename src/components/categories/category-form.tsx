"use client";

import { useActionState, useEffect, useState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import type { ProductCategory } from "@/types/product";
import type { CategoryType } from "@/types/category";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  function handleNameChange(value: string) {
    setName(value);
    // Keep auto-deriving the slug until the user has manually edited it
    // themselves — once they touch the slug field directly, their value
    // takes priority and stops getting overwritten.
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Name</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Bridal Gowns"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">
          Slug{" "}
          <span className="text-muted-foreground/60">
            {slugTouched ? "(custom)" : "(auto-generated — edit to override)"}
          </span>
        </label>
        <input
          type="text"
          name="slug"
          placeholder="bridal-gowns"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
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