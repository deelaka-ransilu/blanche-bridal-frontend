"use client";

import { createContext, useContext } from "react";
import { usePollingStatus } from "@/lib/hooks/use-polling-status";
import { getOrderStatusAction } from "@/lib/actions/orders";
import type { OrderStatus } from "@/types/order";

const TERMINAL_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];

const OrderStatusContext = createContext<OrderStatus | null>(null);

/**
 * Wraps the order detail page content and owns the single polling
 * instance for this order's status. Any descendant — the tracker itself,
 * the payment-continue card, the cancel button — can read the live value
 * via useLiveOrderStatus() without needing to be physically nested inside
 * whichever component happens to render the tracker. This keeps each
 * status-dependent block in its original position on the page instead of
 * forcing them all under one render-prop.
 */
export function OrderStatusProvider({
  orderId,
  initialStatus,
  children,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  children: React.ReactNode;
}) {
  const { value: status } = usePollingStatus<OrderStatus>({
    initialValue: initialStatus,
    isTerminal: (s) => TERMINAL_STATUSES.includes(s),
    fetcher: async () => {
      const result = await getOrderStatusAction(orderId);
      if (!result.success) {
        throw new Error("Failed to fetch order status");
      }
      return result.status;
    },
  });

  return (
    <OrderStatusContext.Provider value={status}>
      {children}
    </OrderStatusContext.Provider>
  );
}

/**
 * Reads the live polled status. Falls back to the server-rendered initial
 * value if called outside a provider (shouldn't happen in practice, but
 * keeps this safe rather than throwing).
 */
export function useLiveOrderStatus(fallback: OrderStatus): OrderStatus {
  const ctx = useContext(OrderStatusContext);
  return ctx ?? fallback;
}