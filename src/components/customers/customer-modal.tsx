"use client";

import { EntityModal } from "@/components/shared/entity-modal";
import { WalkInCustomerForm } from "./walkin-customer-form";

export function CustomerModal({ onClose }: { onClose: () => void }) {
  return (
    <EntityModal title="New walk-in customer" onClose={onClose}>
      <WalkInCustomerForm onSuccess={onClose} />
    </EntityModal>
  );
}