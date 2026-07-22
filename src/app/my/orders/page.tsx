import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { getMyOrders } from "@/lib/api/orders";
import { getMyRentals } from "@/lib/api/rentals";
import { getMyCustomOrders } from "@/lib/api/custom-design";
import type { OrderStatus } from "@/types/order";
import type { RentalStatus } from "@/types/rental";
import { formatDate } from "@/lib/utils";
import { OrdersList, type ActivityItem, type Status } from "@/components/orders/orders-list";

function orderBadgeStatus(status: OrderStatus): Status {
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

function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "PENDING": return "Pending";
    case "CONFIRMED": return "Confirmed";
    case "PROCESSING": return "Processing";
    case "READY": return "Ready";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
  }
}

function rentalBadgeStatus(status: RentalStatus): Status {
  switch (status) {
    case "PENDING_PAYMENT":
      return "pending";
    case "BOOKED":
    case "ACTIVE":
      return "progress";
    case "OVERDUE":
      return "cancelled";
    case "RETURNED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
  }
}

function rentalStatusLabel(status: RentalStatus): string {
  switch (status) {
    case "PENDING_PAYMENT": return "Pending payment";
    case "BOOKED": return "Booked";
    case "ACTIVE": return "Active";
    case "OVERDUE": return "Overdue";
    case "RETURNED": return "Returned";
    case "CANCELLED": return "Cancelled";
  }
}

function customBadgeStatus(status: string | null): Status {
  if (status === null) return "pending";
  return orderBadgeStatus(status as OrderStatus);
}

function customStatusLabel(status: string | null): string {
  if (status === null) return "Awaiting quote";
  return orderStatusLabel(status as OrderStatus);
}

function Breadcrumb() {
  return (
    <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
      <Link href="/my/dashboard" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3 w-3" />
        Home
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground">Orders</span>
    </div>
  );
}

export default async function MyOrdersPage() {
  const [ordersResult, rentalsResult, customOrdersResult] = await Promise.all([
    getMyOrders(),
    getMyRentals(),
    getMyCustomOrders(),
  ]);

  if (!ordersResult.success && !rentalsResult.success && !customOrdersResult.success) {
    return (
      <>
        <Breadcrumb />
        <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
          Your orders
        </h1>
        <p className="text-sm text-status-cancelled">
          Couldn&apos;t load your orders or rentals right now.
        </p>
      </>
    );
  }

  const orderItems: ActivityItem[] = ordersResult.success
    ? ordersResult.data.map((order) => {
        const firstItem = order.items[0];
        const itemSummary = firstItem
          ? firstItem.productName +
            (order.items.length > 1 ? ` +${order.items.length - 1} more` : "")
          : "No items";
        return {
          id: order.id,
          href: `/my/orders/${order.id}`,
          title: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          subtitle: itemSummary,
          badgeStatus: orderBadgeStatus(order.status),
          badgeLabel: orderStatusLabel(order.status),
          createdAt: order.createdAt ?? "",
          kind: "order",
        };
      })
    : [];

  const rentalItems: ActivityItem[] = rentalsResult.success
    ? rentalsResult.data.map((rental) => ({
        id: rental.id,
        href: `/my/rentals/${rental.id}`,
        title: rental.productName ?? "Rental",
        subtitle: `${formatDate(rental.rentalStart)} → ${formatDate(rental.rentalEnd)}`,
        badgeStatus: rentalBadgeStatus(rental.status),
        badgeLabel: rentalStatusLabel(rental.status),
        createdAt: rental.createdAt,
        kind: "rental",
      }))
    : [];

  const customItems: ActivityItem[] = customOrdersResult.success
    ? customOrdersResult.data.map((co) => ({
        id: co.id,
        href: `/my/custom-design/${co.id}`,
        title: "Custom design",
        subtitle: `Occasion ${co.occasionDate}`,
        badgeStatus: customBadgeStatus(co.firstPaymentStatus),
        badgeLabel: customStatusLabel(co.firstPaymentStatus),
        createdAt: co.createdAt,
        kind: "custom",
      }))
    : [];

  const items = [...orderItems, ...rentalItems, ...customItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <Breadcrumb />
      <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
        Your orders
      </h1>
      <OrdersList items={items} />
    </>
  );
}