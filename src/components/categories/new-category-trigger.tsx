"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CategoryModal } from "./category-modal";
import type { ProductCategory } from "@/types/product";
import type { CategoryType } from "@/types/category";

export function NewCategoryTrigger({
  categories,
  type,
  label = "New category",
}: {
  categories: ProductCategory[];
  type: CategoryType;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
      {open && (
        <CategoryModal categories={categories} type={type} onClose={() => setOpen(false)} />
      )}
    </>
  );
}