"use client";

import { useState } from "react";
import type { MockCategory } from "@/lib/mock/products-mock";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function RentalCategoryForm({
  existingCategories,
  onCreate,
}: {
  existingCategories: MockCategory[];
  onCreate: (category: MockCategory) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit() {
    if (!name.trim() || !slug.trim()) return;
    // Frontend-first phase: local state only. Swap for a real
    // createCategoryAction call (with type=DRESS) once the backend
    // `type` column on categories lands.
    onCreate({
      id: `cat-dress-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim(),
      type: "DRESS",
    });
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Name
        <input
          className="rounded-md border px-3 py-2"
          placeholder="e.g. Ball Gowns"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </label>

      <label className="grid gap-1 text-sm">
        Slug
        <input
          className="rounded-md border px-3 py-2"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </label>

      <label className="grid gap-1 text-sm">
        Parent
        <select
          className="rounded-md border px-3 py-2"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">No parent</option>
          {existingCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handleSubmit}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Add category
      </button>
    </div>
  );
}