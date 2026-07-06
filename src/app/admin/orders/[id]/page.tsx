import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getProductionForOrder } from "@/lib/api/production";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { ProductionStageTracker } from "@/components/production-stage-tracker";
import { OrderStatusForm } from "@/components/order-status-form";
import type { OrderStatus } from "@/types/order";
import { CreateProductionButton } from "@/components/create-production-button";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={danger ? "font-medium text-status-cancelled" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function toBadgeStatus(status: OrderStatus): Status {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "PROCESSING":
    case "READY":
      return "progress";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING": return "Pending";
    case "CONFIRMED": return "Confirmed";
    case "PROCESSING": return "Processing";
    case "READY": return "Ready";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
  }
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success) {
    notFound();
  }

  const order = result.data;
  const production = await getProductionForOrder(id);

  const customerName = [order.customerFirstName, order.customerLastName]
    .filter(Boolean)
    .join(" ") || order.customerEmail || "Unknown customer";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {customerName} · placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={toBadgeStatus(order.status)}>
            {statusLabel(order.status)}
          </StatusBadge>
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            Order details
          </p>
          {order.items.length === 0 && (
            <p className="text-[13px] text-muted-foreground">No items on this order.</p>
          )}
          {order.items.map((item, i) => (
            <DetailRow
              key={i}
              label={`${item.productName}${item.size ? ` (${item.size})` : ""} × ${item.quantity}`}
              value={formatCurrency(item.subtotal)}
            />
          ))}
          <DetailRow label="Total" value={formatCurrency(order.totalAmount)} />
          <DetailRow label="Fulfillment" value={order.fulfillmentMethod ?? "—"} />
          {order.deliveryAddress && (
            <DetailRow label="Delivery address" value={order.deliveryAddress} />
          )}
          <DetailRow label="Order mode" value={order.orderMode} />
          {order.notes && <DetailRow label="Notes" value={order.notes} />}
        </div>

        {production.found ? (
          <ProductionStageTracker
            record={production.data}
            role="admin"
            orderId={order.id}
            orderStatus={order.status}
          />
        ) : "error" in production ? (
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-sm text-status-cancelled">{production.error}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              This order doesn&apos;t have production tracking yet.
            </p>
            <CreateProductionButton orderId={order.id} />
          </div>
        )}
      </div>
    </div>
  );
}