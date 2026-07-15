"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, RefreshCw } from "lucide-react";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";

export type { Status };

export type ActivityItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  badgeStatus: Status;
  badgeLabel: string;
  createdAt: string;
  kind: "order" | "rental";
};

type Filter = "all" | "order" | "rental";

export function OrdersList({ items }: { items: ActivityItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["all", "order", "rental"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "order" ? "Orders" : "Rentals"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((item) => (
          <Link
            key={`${item.kind}-${item.id}`}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-primary/5"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
              {item.kind === "order" ? (
                <Package className="h-4 w-4 text-muted-foreground" />
              ) : (
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <StatusBadge status={item.badgeStatus}>{item.badgeLabel}</StatusBadge>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "You haven't placed any orders or rentals yet."
              : `No ${filter}s yet.`}
          </p>
        )}
      </div>
    </div>
  );
}