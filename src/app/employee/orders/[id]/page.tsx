import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/api/orders";
import { getProductionForOrder } from "@/lib/api/production";
import { ProductionStageTracker } from "@/components/production-stage-tracker";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function EmployeeOrderDetailPage({
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
        href="/employee/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-5">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {customerName} · placed {formatDate(order.createdAt)}
        </p>
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
          <DetailRow label="Payment method" value={order.paymentMethod} />
        </div>

        {production.found ? (
          <ProductionStageTracker
            record={production.data}
            role="employee"
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
              This order doesn&apos;t have production tracking yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}