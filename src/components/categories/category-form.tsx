"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

export function CategoryForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="slug"
          placeholder="slug"
          required
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          name="parentId"
          defaultValue=""
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">No parent</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit">Add Category</Button>
      </div>
      {state && !state.success && <p className="text-sm text-destructive">{state.message}</p>}
      {state?.success && <p className="text-sm text-status-completed">{state.message}</p>}
    </form>
  );
}