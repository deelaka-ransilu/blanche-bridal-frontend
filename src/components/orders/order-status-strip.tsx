"use client";

import { useEffect, useRef } from "react";
import { Clock, BadgeCheck, Scissors, PackageCheck, Check, X } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STATUSES: { status: OrderStatus; label: string; icon: typeof Clock; badgeStatus: "pending" | "progress" | "completed" | "cancelled" }[] = [
  { status: "PENDING", label: "Pending", icon: Clock, badgeStatus: "pending" },
  { status: "CONFIRMED", label: "Confirmed", icon: BadgeCheck, badgeStatus: "progress" },
  { status: "PROCESSING", label: "Processing", icon: Scissors, badgeStatus: "progress" },
  { status: "READY", label: "Ready", icon: PackageCheck, badgeStatus: "progress" },
  { status: "COMPLETED", label: "Completed", icon: Check, badgeStatus: "completed" },
  { status: "CANCELLED", label: "Cancelled", icon: X, badgeStatus: "cancelled" },
];

const BADGE_STYLE: Record<"pending" | "progress" | "completed" | "cancelled", string> = {
  pending: "bg-status-pending/15 text-status-pending",
  progress: "bg-status-progress/15 text-status-progress",
  completed: "bg-status-completed/15 text-status-completed",
  cancelled: "bg-status-cancelled/15 text-status-cancelled",
};

export function OrderStatusStrip({ status }: { status: OrderStatus }) {
  const activeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [status]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STATUSES.map((s) => {
        const isActive = s.status === status;
        const Icon = s.icon;
        return (
          <span
            key={s.status}
            ref={isActive ? activeRef : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? BADGE_STYLE[s.badgeStatus] : "bg-muted/40 text-muted-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            {s.label}
          </span>
        );
      })}
    </div>
  );
}