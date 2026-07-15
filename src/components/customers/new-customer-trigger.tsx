"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CustomerModal } from "./customer-modal";

export function NewCustomerTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        New customer
      </button>
      {open && <CustomerModal onClose={() => setOpen(false)} />}
    </>
  );
}