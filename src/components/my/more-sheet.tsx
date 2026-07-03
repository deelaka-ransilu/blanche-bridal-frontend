"use client";

import Link from "next/link";
import { X, RefreshCw, CreditCard, Ruler, Settings } from "lucide-react";

const items = [
  { href: "/my/rentals", label: "Rentals", icon: RefreshCw },
  { href: "/my/payments", label: "Payments", icon: CreditCard },
  { href: "/my/measurements", label: "Measurements", icon: Ruler },
  { href: "/my/settings", label: "Settings", icon: Settings },
];

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card p-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-heading text-base font-medium text-foreground">More</p>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm text-foreground hover:bg-primary/5"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}