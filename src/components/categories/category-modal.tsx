"use client";

import { EntityModal } from "@/components/shared/entity-modal";
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
    <EntityModal title={title} onClose={onClose}>
      <CategoryForm categories={categories} type={type} onSuccess={onClose} />
    </EntityModal>
  );
}