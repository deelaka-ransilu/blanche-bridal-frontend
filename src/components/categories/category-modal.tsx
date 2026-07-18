"use client";

import { X } from "lucide-react";
import { CategoryForm } from "./category-form";
import type { ProductCategory } from "@/types/product";
import type { CategoryType } from "@/types/category";

export function CategoryModal({
  categories,
  type,
  onClose,
}: {
  categories: ProductCategory[];
  type: CategoryType;
  onClose: () => void;
}) {
  const title = type === "DRESS" ? "New rental category" : "New category";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-medium text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CategoryForm categories={categories} type={type} onSuccess={onClose} />
      </div>
    </div>
  );
}