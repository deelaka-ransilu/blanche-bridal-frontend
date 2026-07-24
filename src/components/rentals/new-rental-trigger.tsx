"use client";

import { ModalTrigger } from "@/components/shared/modal-trigger";
import { RentalModal } from "./rental-modal";
import type { Product } from "@/types/product";
import type { AdminUser } from "@/types/user";

export function NewRentalTrigger({
  products,
  customers,
}: {
  products: Product[];
  customers: AdminUser[];
}) {
  return (
    <ModalTrigger
      label="New rental"
      renderModal={(onClose) => (
        <RentalModal products={products} customers={customers} onClose={onClose} />
      )}
    />
  );
}