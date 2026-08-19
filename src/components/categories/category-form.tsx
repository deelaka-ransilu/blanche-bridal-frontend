"use client";

import { useActionState, useState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/lib/actions/catalog/categories";
import { Button } from "@/components/ui/button";
import { FormStatusMessage } from "@/components/shared/form-status-message";
import { useFormSuccess } from "@/lib/hooks/use-form-success";
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

  useFormSuccess(state, onSuccess);

  function handleNameChange(value: string) {
    setName(value);
    // Slug is always auto-derived from the name now — no manual override
    // UI, so it just tracks the name directly on every keystroke.
    setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="slug" value={slug} />

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

      <FormStatusMessage state={state} />

      <Button type="submit" className="w-full">
        Add Category
      </Button>
    </form>
  );
}