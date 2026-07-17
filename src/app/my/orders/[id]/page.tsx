import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getProductionForOrder } from "@/lib/api/production";
import { getReceiptByOrderId } from "@/lib/api/receipts";
import { ProductionStageTracker } from "@/components/production-stage-tracker";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { CancelOrderButton } from "@/components/cancel-order-button";
import type { OrderStatus } from "@/types/order";
import { formatDate } from "@/lib/utils";
import { PaymentContinueCard } from "@/components/payment-continue-card";
import { ReceiptDownloadButton } from "@/components/receipt-download-button";

// Placeholder — swap in the real boutique contact details.
const BOUTIQUE_CONTACT = {
  phone: "071 123 4567",
  email: "blanchebridal.noreply@gmail.com",
  address: "123 Galle Road, Colombo 03",
};

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

  if (!result.success) notFound();

  const order = result.data;
  const production = await getProductionForOrder(id);
  const isPickup = order.fulfillmentMethod?.toUpperCase() === "PICKUP";

  // PENDING orders can't have a receipt yet, so skip the call entirely.
  // Uses the dedicated by-order lookup endpoint rather than fetching the
  // customer's entire receipt list and filtering client-side.
  const receipt =
    order.status !== "PENDING"
      ? await getReceiptByOrderId(order.id).then((r) => (r.success ? r.data : undefined))
      : undefined;

  return (
    <>
      <Link
        href="/my/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-4">
        <h1 className="font-heading text-xl font-medium text-foreground">
          {order.isRentalDeposit ? "Rental Booking" : "Order"} #
          {order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Placed {formatDate(order.createdAt)}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <OrderStatusTracker status={order.status} fulfillmentMethod={order.fulfillmentMethod} />

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            {order.isRentalDeposit ? "Rental deposit details" : "Order details"}
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
          {!order.isRentalDeposit && (
            <DetailRow label="Fulfillment" value={order.fulfillmentMethod ?? "—"} />
          )}
          {order.deliveryAddress && (
            <DetailRow label="Delivery address" value={order.deliveryAddress} />
          )}
        </div>

        {isPickup && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-heading mb-3 text-sm font-medium text-foreground">
              Pickup information
            </p>
            <p className="mb-3 text-[13px] text-muted-foreground">
              We&apos;ll call you once your order is ready. Please bring a copy of this order
              confirmation when you come to collect it.
            </p>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {BOUTIQUE_CONTACT.address}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {BOUTIQUE_CONTACT.phone}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {BOUTIQUE_CONTACT.email}
              </div>
            </div>
          </div>
        )}

        {order.status === "PENDING" && (
          <PaymentContinueCard
            orderId={order.id}
            paymentMethod={order.paymentMethod}
            isRentalDeposit={order.isRentalDeposit}
            createdAt={order.createdAt ?? new Date().toISOString()}
          />
        )}

        {receipt && (
          <ReceiptDownloadButton receiptId={receipt.id} receiptNumber={receipt.receiptNumber} />
        )}

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