"use client";

import { EntityModal } from "@/components/shared/entity-modal";
import { EmployeeForm } from "./employee-form";

export function EmployeeModal({ onClose }: { onClose: () => void }) {
  return (
    <EntityModal title="New employee" onClose={onClose}>
      <EmployeeForm onSuccess={onClose} />
    </EntityModal>
  );
}