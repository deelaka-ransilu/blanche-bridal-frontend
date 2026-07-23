"use client";

import { useLiveOrderStatus } from "@/components/order-status-context";
import type { OrderStatus } from "@/types/order";

/**
 * Shows/hides its children based on the LIVE polled status rather than the
 * server-rendered snapshot. Use this to wrap anything that should
 * disappear/appear the moment an admin changes an order's status, without
 * requiring the customer to reload.
 *
 * `allow` takes a plain array of statuses rather than a predicate function
 * — a function prop can't cross the Server → Client Component boundary
 * (Next.js throws "Functions cannot be passed directly to Client
 * Components" since a function isn't serializable RSC payload). An array
 * of OrderStatus strings is, so the page (a Server Component) can safely
 * pass "which statuses should show this" without needing "use server".
 */
export function OrderStatusGate({
  initialStatus,
  allow,
  children,
}: {
  initialStatus: OrderStatus;
  allow: OrderStatus[];
  children: React.ReactNode;
}) {
  const status = useLiveOrderStatus(initialStatus);
  if (!allow.includes(status)) return null;
  return <>{children}</>;
}