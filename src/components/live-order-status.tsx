"use client";

import { OrderStatusTracker } from "@/components/order-status-tracker";
import { useLiveOrderStatus } from "@/components/order-status-context";
import type { OrderStatus } from "@/types/order";

export function LiveOrderStatus({
  initialStatus,
  fulfillmentMethod,
}: {
  initialStatus: OrderStatus;
  fulfillmentMethod?: string | null;
}) {
  const status = useLiveOrderStatus(initialStatus);
  return <OrderStatusTracker status={status} fulfillmentMethod={fulfillmentMethod} />;
}