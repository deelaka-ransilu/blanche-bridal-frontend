import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dummyOrders } from "@/lib/dummy-data/orders";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductionStageTracker } from "@/components/production-stage-tracker";

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

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = dummyOrders.find((o) => o.id === id);

  // NOTE: once lib/api/customer/* exists, also verify this order belongs
  // to the logged-in customer, not just that the ID exists.
  if (!order) notFound();

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
            Order #{order.id}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Placed {order.placedDate}
          </p>
        </div>
        <StatusBadge status={order.status}>{order.statusLabel}</StatusBadge>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            Order details
          </p>
          <DetailRow label="Item" value={order.item} />
          <DetailRow label="Size" value={order.size} />
          <DetailRow label="Total" value={order.total} />
          <DetailRow label="Balance due" value={order.balanceDue} danger />
        </div>

        <ProductionStageTracker stages={order.stages} role="customer" />
      </div>
    </>
  );
}