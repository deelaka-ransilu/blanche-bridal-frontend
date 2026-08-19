import { getAllOrders } from "@/lib/api/orders/orders";
import { getAllRentals } from "@/lib/api/catalog/rentals";
import { getAvailableProducts } from "@/lib/api/catalog/products";
import { getCustomers } from "@/lib/api/people/customers";
import { NewOrderTrigger } from "@/components/orders/new-order-trigger";
import { StatusBadge, type Status } from "@/components/dashboard/status-badge";
import { AdminOrdersTabsWithHeader } from "@/components/admin/tabs/admin-orders-tabs-with-header";
import type { OrderStatus } from "@/types/order";
import { getAllCustomOrders } from "@/lib/api/production/custom-design";
import type { Rental, RentalStatus } from "@/types/rental";

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

function stageLabel(stage: string | null): string {
  if (!stage) return "Not started";
  return stage
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const RENTAL_STATUS_MAP: Record<RentalStatus, Status> = {
  PENDING_PAYMENT: "pending",
  BOOKED: "progress",
  ACTIVE: "progress",
  OVERDUE: "cancelled",
  RETURNED: "completed",
  CANCELLED: "cancelled",
};

const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  BOOKED: "Booked",
  ACTIVE: "Active",
  OVERDUE: "Overdue",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

// Terminal statuses sink to the bottom (most recent first). Everything else
// sorts by whichever date is most relevant to what the admin needs to act on
// next — soonest first, so the most time-sensitive rentals surface at top.
const TERMINAL: RentalStatus[] = ["RETURNED", "CANCELLED"];

function sortKey(rental: Rental): number {
  const pick = (d: string | null) => (d ? new Date(d + "T00:00:00").getTime() : Infinity);

  switch (rental.status) {
    case "PENDING_PAYMENT":
      return pick(rental.fittingDate) ;
    case "BOOKED":
      return pick(rental.fittingDate ?? rental.rentalStart);
    case "ACTIVE":
    case "OVERDUE":
      return pick(rental.rentalEnd);
    default:
      return Infinity;
  }
}

function sortRentals(rentals: Rental[]): Rental[] {
  const active = rentals.filter((r) => !TERMINAL.includes(r.status));
  const terminal = rentals.filter((r) => TERMINAL.includes(r.status));

  active.sort((a, b) => sortKey(a) - sortKey(b));
  terminal.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return [...active, ...terminal];
}

// Keeps the first occurrence of each id and drops the rest. This is a
// defensive guard against the API returning duplicate rows (e.g. from a
// join that fans out) — it stops React's "unique key" warning and any
// duplicate rendering, but the root cause should still be tracked down
// on the backend.
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export default async function AdminOrdersPage() {
  const [ordersResult, rentalsResult, productsResult, customersResult, customOrdersResult] =
    await Promise.all([
      getAllOrders(),
      getAllRentals(),
      getAvailableProducts(),
      getCustomers(),
      getAllCustomOrders(),
    ]);

  const orders = ordersResult.success ? ordersResult.data : [];
  // Rental deposit payments are Orders under the hood (for payment
  // tracking), but they represent a rental booking, not a dress purchase --
  // the Rentals tab already shows this same booking, so exclude them here
  // to avoid showing the same booking in two tabs.
  const purchaseOrders = orders.filter(
    (order) => !order.isRentalDeposit && !order.customDesignRequestId
  );
  const rentals = rentalsResult.success ? sortRentals(rentalsResult.data) : [];
  const products = productsResult.success ? dedupeById(productsResult.data) : [];
  const customers = customersResult.success ? dedupeById(customersResult.data) : [];
  const customOrders = customOrdersResult.success ? customOrdersResult.data : [];

  const dupCheck = (label: string, items: { id: string }[]) => {
    const seen = new Set<string>();
    const dupes = items.filter((i) => {
      if (seen.has(i.id)) return true;
      seen.add(i.id);
      return false;
    });
    if (dupes.length > 0) {
      console.error(`[DUPLICATE IDS] ${label}:`, dupes.map((d) => d.id));
    }
  };
  dupCheck("purchaseOrders", purchaseOrders);
  dupCheck("rentals", rentals);
  dupCheck("customOrders", customOrders);
  // Checked against the raw API results (pre-dedupe) so this still tells us
  // if the backend is sending duplicates, even though `products`/`customers`
  // below are already cleaned up.
  if (productsResult.success) dupCheck("products (raw)", productsResult.data);
  if (customersResult.success) dupCheck("customers (raw)", customersResult.data);

  const purchasesContent = (
    <div>
      {!ordersResult.success && (
        <p className="mb-3 text-sm text-status-cancelled">
          Couldn&apos;t load orders: {ordersResult.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {purchaseOrders.map((order) => {
          const customerName = [order.customerFirstName, order.customerLastName]
            .filter(Boolean)
            .join(" ") || order.customerEmail || "Unknown customer";
          const firstItem = order.items[0];
          const itemSummary = firstItem
            ? firstItem.productName + (order.items.length > 1 ? ` +${order.items.length - 1} more` : "")
            : "No items";

          return (
            <a
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between ${
                order.status === "CANCELLED" ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-baline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {customerName} · {itemSummary}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusBadge status={toBadgeStatus(order.status)}>
                  {statusLabel(order.status)}
                </StatusBadge>
              </div>
            </a>
          );
        })}
        {purchaseOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
      </div>
    </div>
  );

  const rentalsContent = (
    <div className="space-y-2.5">
      {!rentalsResult.success && (
        <p className="text-sm text-destructive">{rentalsResult.message}</p>
      )}
      {!productsResult.success && (
        <p className="text-sm text-destructive">
          Failed to load products: {productsResult.message}
        </p>
      )}
      {!customersResult.success && (
        <p className="text-sm text-destructive">
          Failed to load customers: {customersResult.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {rentals.map((rental) => {
          const dateLine =
            rental.status === "PENDING_PAYMENT" && rental.fittingDate
              ? `Fitting ${rental.fittingDate}`
              : rental.status === "BOOKED" && rental.fittingDate
                ? `Fitting ${rental.fittingDate} · pickup ${rental.rentalStart}`
                : `${rental.rentalStart} → ${rental.rentalEnd}`;

          return (
            <a
              key={rental.id}
              href={`/admin/rentals/${rental.id}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{rental.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {rental.customerName} · {dateLine}
                </p>
              </div>
              <StatusBadge status={RENTAL_STATUS_MAP[rental.status]}>
                {RENTAL_STATUS_LABEL[rental.status]}
              </StatusBadge>
            </a>
          );
        })}
        {rentals.length === 0 && (
          <p className="text-sm text-muted-foreground">No rentals yet.</p>
        )}
      </div>
    </div>
  );

  const customOrdersContent = (
    <div className="space-y-2.5">
      {!customOrdersResult.success && (
        <p className="text-sm text-destructive">{customOrdersResult.message}</p>
      )}

      <div className="flex flex-col gap-2.5">
        {customOrders.map((co) => (
          <a
            key={co.id}
            href={`/admin/custom-orders/${co.id}`}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{co.customerName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {co.customerEmail} · occasion {co.occasionDate}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {co.firstPaymentStatus === null ? (
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Awaiting quote
                </span>
              ) : (
                <>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {stageLabel(co.currentProductionStage)}
                  </span>
                  <StatusBadge status={toBadgeStatus(co.firstPaymentStatus as OrderStatus)}>
                    {statusLabel(co.firstPaymentStatus as OrderStatus)}
                  </StatusBadge>
                </>
              )}
            </div>
          </a>
        ))}
        {customOrders.length === 0 && (
          <p className="text-sm text-muted-foreground">No custom orders yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <AdminOrdersTabsWithHeader
      purchasesCount={purchaseOrders.length}
      rentalsCount={rentals.length}
      customOrdersCount={customOrders.length}
      purchasesContent={purchasesContent}
      rentalsContent={rentalsContent}
      customOrdersContent={customOrdersContent}
      orderTrigger={<NewOrderTrigger products={products} customers={customers} />}
    />
  );
}