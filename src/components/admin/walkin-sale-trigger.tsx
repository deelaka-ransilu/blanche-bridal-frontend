"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WalkInSalePanel } from "./walkin-sale-panel";

export function WalkInSaleTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-full w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Quick sale
      </button>

      {open && <WalkInSalePanel onClose={() => setOpen(false)} />}
    </>
  );
}