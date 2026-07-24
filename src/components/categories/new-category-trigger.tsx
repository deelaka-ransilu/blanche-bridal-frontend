"use client";

import { ModalTrigger } from "@/components/shared/modal-trigger";
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
  return (
    <ModalTrigger
      label={label}
      renderModal={(onClose) => (
        <CategoryModal categories={categories} type={type} onClose={onClose} />
      )}
    />
  );
}