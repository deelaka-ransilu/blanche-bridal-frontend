"use client";

import { ModalTrigger } from "@/components/shared/modal-trigger";
import { NewOrderModal } from "./new-order-modal";
import type { Product } from "@/types/product";
import type { AdminUser } from "@/types/user";

export function NewOrderTrigger({
  products,
  customers,
}: {
  products: Product[];
  customers: AdminUser[];
}) {
  return (
    <ModalTrigger
      label="New order"
      renderModal={(onClose) => (
        <NewOrderModal products={products} customers={customers} onClose={onClose} />
      )}
    />
  );
}