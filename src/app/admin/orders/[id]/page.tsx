import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Wallet,
  BadgeCheck,
  Landmark,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getBankDetails } from "@/lib/api/refunds";
import { getReceiptByOrderId } from "@/lib/api/receipts";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { OrderStatusForm } from "@/components/order-status-form";
import { ReceiptDownloadButton } from "@/components/receipt-download-button";
import type { OrderStatus } from "@/types/order";
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

  const customerName = [order.customerFirstName, order.customerLastName]
    .filter(Boolean)
    .join(" ") || order.customerEmail || "Unknown customer";

  const needsCashConfirm = order.status === "PENDING" && order.paymentMethod === "CASH";

  // Refund is owed whenever a payment actually went through and hasn't
  // been refunded yet — this is NOT tied to order.status. A payment stays
  // COMPLETED even if the order itself is later cancelled, so a cancelled-
  // but-paid order still needs a refund even though it's not "COMPLETED".
  const refundNeeded = order.status === "CANCELLED" && order.paymentStatus === "COMPLETED";
  const alreadyRefunded = order.paymentStatus === "REFUNDED";
  const showPaymentCard = order.paymentStatus != null; // no Payment row at all yet → skip entirely

  // Only fetch bank details when they're actually relevant — avoids an
  // extra request (and a guaranteed 404) on every order page load.
  const bankDetails = refundNeeded ? await getBankDetails(order.id) : null;

  // Receipt only exists once an order has moved past PENDING (mirrors the
  // same skip used on the customer-facing /my/orders/[id] page) — avoids a
  // guaranteed 404 on every still-PENDING admin order view.
  const receipt =
    order.status !== "PENDING"
      ? await getReceiptByOrderId(order.id).then((r) => (r.success ? r.data : undefined))
      : undefined;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      {/* Header now just carries identity — no status pills here anymore,
          that's fully owned by the "Order status" card below. */}
      <div className="mb-4">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {customerName} · placed {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Customer contact: staff resolving a delivery/payment issue
          shouldn't have to leave this page to find how to reach the
          customer. Only renders if we actually have something to show. */}
      {(order.customerPhone || order.customerEmail || order.deliveryAddress) && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">Customer</p>
          <div className="space-y-2 text-[13px]">
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {order.customerPhone}
              </div>
            )}
            {order.customerEmail && (
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {order.customerEmail}
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {order.deliveryAddress}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status card: visual tracker (read-only "where is this order") sits
          directly above the change-status control (the actual action) --
          one card, one concept, instead of a header pill row duplicating
          the same six-state enum shown again as icons below. */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="mb-3.5 flex items-center justify-between">
          <p className="font-heading text-sm font-medium text-foreground">Order status</p>
          {order.updatedAt && (
            <p className="text-[11px] text-muted-foreground">
              Updated {formatDate(order.updatedAt)}
            </p>
          )}
        </div>

        <OrderStatusTracker status={order.status} fulfillmentMethod={order.fulfillmentMethod} bare />

        <div className="mt-4 border-t border-border pt-3.5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Change status
          </p>
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>

        {needsCashConfirm && (
          <div className="mt-3.5 border-t border-border pt-3.5">
            <ConfirmCashPaymentButton orderId={order.id} />
          </div>
        )}
      </div>

      {/* Payment & Refund: always visible once a Payment row exists, so
          admin can see refund status regardless of order status — a
          cancelled order that was already paid still needs this. */}
      {showPaymentCard && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            {refundNeeded || alreadyRefunded ? "Payment & refund" : "Payment"}
          </p>

          <div className="flex items-center gap-2 text-[13px]">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Payment status</span>
            <span
              className={`ml-auto font-medium ${
                alreadyRefunded
                  ? "text-muted-foreground"
                  : refundNeeded
                    ? "text-emerald-500"
                    : order.paymentStatus === "FAILED"
                      ? "text-status-cancelled"
                      : "text-amber-500"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>

          {receipt && (
            <div className="mt-3 border-t border-border pt-3">
              <ReceiptDownloadButton receiptId={receipt.id} receiptNumber={receipt.receiptNumber} />
            </div>
          )}

          {alreadyRefunded && (
            <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[12px] text-muted-foreground">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <p>
                Refunded
                {order.refundAmount != null ? ` — ${formatCurrency(order.refundAmount)}` : ""}
                {order.refundedAt ? ` on ${formatDate(order.refundedAt)}` : ""}.
              </p>
            </div>
          )}

          {refundNeeded && (
            <>
              <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-[12px] text-amber-600">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  {order.status === "CANCELLED"
                    ? "This order was cancelled after payment was taken — a refund is owed."
                    : "Payment was completed but hasn't been refunded."}
                </p>
              </div>

              {/* Bank details: where the manual transfer should go. Gate
                  the refund button on this existing — issuing a refund
                  with nowhere on file to send the money is exactly the
                  mistake this feature exists to prevent. */}
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Landmark className="h-3 w-3" /> Bank details
                </p>

                {bankDetails?.success ? (
                  <div className="rounded-lg border border-border bg-background p-2.5 text-[12px]">
                    <DetailRow label="Account holder" value={bankDetails.data.accountHolderName} />
                    <DetailRow label="Account number" value={bankDetails.data.accountNumber} />
                    <DetailRow label="Bank" value={bankDetails.data.bankName} />
                    {bankDetails.data.branch && (
                      <DetailRow label="Branch" value={bankDetails.data.branch} />
                    )}
                    <DetailRow
                      label="Submitted"
                      value={formatDate(bankDetails.data.submittedAt)}
                    />
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-2.5 text-[12px] text-muted-foreground">
                    Customer hasn&apos;t submitted bank details yet — the refund button will
                    unlock once they do.
                  </p>
                )}
              </div>

              {bankDetails?.success && (
                <div className="mt-3 max-w-xs">
                  <RefundOrderButton orderId={order.id} />
                </div>
              )}
            </>
          )}
        </div>
      )}

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
    </div>
  );
}