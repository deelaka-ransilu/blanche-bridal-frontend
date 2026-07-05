import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getProductionForOrder } from "@/lib/api/production";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { ProductionStageTracker } from "@/components/production-stage-tracker";
import { CancelOrderButton } from "@/components/cancel-order-button";
import type { OrderStatus } from "@/types/order";

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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });
}

// Assumption (no business rule was specified): only show the cancel button
// while the order hasn't already reached a terminal state. Backend still
// enforces its own rule independently -- this is purely to avoid showing a
// button that would just error.

function canCancel(status: OrderStatus): boolean {
  return status === "PENDING";
}

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderById(id);

  // Backend already enforces that a CUSTOMER can only fetch their own order
  // (OrderServiceImpl.getOrderById throws UnauthorizedException otherwise),
  // so a failed result here covers both "doesn't exist" and "not yours" --
  // no separate ownership check needed on the frontend.
  if (!result.success) notFound();

  const order = result.data;
  const production = await getProductionForOrder(id);

  return (
    <>
      <Link
        href="/my/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={toBadgeStatus(order.status)}>
          {statusLabel(order.status)}
        </StatusBadge>
      </div>

      <div className="flex flex-col gap-4">
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
        </div>

        {/* Production Tracking -- wired to GET /api/orders/{id}/production.
            "No record" is a normal, valid state (order isn't a custom order
            under the Option C design), not an error. Customer role has no
            approve/reject/propose actions -- read-only display only, so
            orderStatus gating doesn't change customer's own view, but is
            passed through for consistency/future-proofing. */}
        {production.found ? (
          <ProductionStageTracker
            record={production.data}
            role="customer"
            orderId={order.id}
            orderStatus={order.status}
          />
        ) : "error" in production ? (
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-sm text-status-cancelled">{production.error}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4">
            <p className="text-sm text-muted-foreground">
              This order doesn&apos;t have production tracking.
            </p>
          </div>
        )}

        {canCancel(order.status) && <CancelOrderButton orderId={order.id} />}
      </div>
    </>
  );
}