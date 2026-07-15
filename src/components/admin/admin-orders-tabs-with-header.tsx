"use client";

import { useState, type ReactNode } from "react";

export function AdminOrdersTabsWithHeader({
  purchasesCount,
  rentalsCount,
  purchasesContent,
  rentalsContent,
  orderTrigger,
  rentalTrigger,
}: {
  purchasesCount: number;
  rentalsCount: number;
  purchasesContent: ReactNode;
  rentalsContent: ReactNode;
  orderTrigger: ReactNode;
  rentalTrigger: ReactNode;
}) {
  const [tab, setTab] = useState<"purchases" | "rentals">("purchases");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-medium text-foreground">Orders</h1>
          <p className="text-[13px] text-muted-foreground">
            {purchasesCount} orders · {rentalsCount} rentals
          </p>
        </div>
        {tab === "purchases" ? orderTrigger : rentalTrigger}
      </div>

      <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("purchases")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "purchases"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Purchases <span className="opacity-70">· {purchasesCount}</span>
        </button>
        <button
          onClick={() => setTab("rentals")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "rentals"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Rentals <span className="opacity-70">· {rentalsCount}</span>
        </button>
      </div>

      {tab === "purchases" ? purchasesContent : rentalsContent}
    </div>
  );
}