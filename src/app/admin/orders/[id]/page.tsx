import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getProductionForOrder } from "@/lib/api/production";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { ProductionStageTracker } from "@/components/production-stage-tracker";
import { OrderStatusForm } from "@/components/order-status-form";
import type { OrderStatus } from "@/types/order";
import { CreateProductionButton } from "@/components/create-production-button";
import { RefundOrderButton } from "@/components/orders/refund-order-button";
import { ConfirmCashPaymentButton } from "@/components/orders/confirm-cash-payment-button";
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

  const isTerminal = order.status === "COMPLETED" || order.status === "CANCELLED";
  const productionApproved = production.found && production.data.status === "APPROVED";
  const showProductionWarning = !isTerminal && !productionApproved;
  const needsCashConfirm = order.status === "PENDING" && order.paymentMethod === "CASH";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {customerName} · placed {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Status card: everything about "where this order is right now and
          what needs doing next" lives in one card instead of three separate
          bordered blocks (tracker / warning / cash button used to each be
          their own box). The warning is now an inline note inside this card
          rather than a full-width banner competing with it, and the
          cash-confirm action is filled/primary since it's the actual next
          step, not a secondary option next to a loud warning. */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="font-heading mb-3.5 text-sm font-medium text-foreground">
          Order status
        </p>
        <OrderStatusTracker status={order.status} bare />

        {showProductionWarning && (
          <div className="mt-4 flex items-start gap-2 border-t border-border pt-3.5 text-[12px] text-amber-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Production tracking isn&apos;t approved yet.
              {!production.found
                ? " No production record has been started."
                : production.data.status === "PENDING_APPROVAL"
                ? " A stage change is waiting on your approval."
                : production.data.status === "REJECTED"
                ? " The last proposed stage was rejected and hasn't been resubmitted."
                : ""}
              {" "}Double-check the work before marking this Ready or Completed.
            </p>
          </div>
        )}

        {needsCashConfirm && (
          <div className="mt-3.5 border-t border-border pt-3.5">
            <ConfirmCashPaymentButton orderId={order.id} />
          </div>
        )}
      </div>

      {/* Refunds are single-full-refund-per-order and only make sense once
          COMPLETED — kept as its own small card since it's a distinct,
          occasional action, not part of the routine status flow above. */}
      {order.status === "COMPLETED" && (
        <div className="mb-4 max-w-xs">
          <RefundOrderButton orderId={order.id} />
        </div>
      )}

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
          <DetailRow label="Payment method" value={order.paymentMethod} />
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