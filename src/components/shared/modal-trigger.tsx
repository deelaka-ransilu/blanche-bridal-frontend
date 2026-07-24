"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function ModalTrigger({
  label,
  renderModal,
}: {
  label: string;
  renderModal: (onClose: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
      {open && renderModal(() => setOpen(false))}
    </>
  );
}