"use client";

import { useState } from "react";
import { WalkInSalePanel } from "./walkin-sale-panel";

export function WalkInSaleTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center self-start rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
      >
        Quick sale
      </button>

      {open && <WalkInSalePanel onClose={() => setOpen(false)} />}
    </>
  );
}