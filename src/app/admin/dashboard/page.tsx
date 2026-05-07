"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";
import { listCustomers } from "@/lib/api/auth";
import {
  PaginatedResponse,
  AppointmentResponse,
  OrderResponse,
  InquiryResponse,
  RentalResponse,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  customers: number;
  appointments: number;
  pendingAppointments: number;
  orders: number;
  activeRentals: number;
  overdueRentals: number;
  inquiries: number;
  openInquiries: number;
  reviews: number;
  pendingReviews: number;
  averageRating: number;
}

interface ReviewStatsResponse {
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground mb-2.5">
      {children}
    </p>
  );
}

function MetricCard({
  label,
  icon,
  value,
  sub,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  sub: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="bg-muted/60 rounded-xl px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
        {icon}
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-14 mb-1.5" />
      ) : (
        <p className="text-[26px] font-medium leading-none text-foreground mb-1.5">
          {value}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function CardShell({
  title,
  onViewAll,
  children,
}: {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
        <span className="text-[13px] font-medium text-foreground">{title}</span>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[12px] text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          >
            View all
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function RowItem({
  iconContent,
  iconColor,
  iconLabel,
  title,
  sub,
  badge,
}: {
  iconContent: React.ReactNode;
  iconColor: string;
  iconLabel: string;
  title: string;
  sub: React.ReactNode;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border/50 last:border-b-0">
      <div
        className="w-[34px] h-[42px] bg-muted/60 rounded-md flex flex-col items-center justify-center gap-0.5 shrink-0"
        style={{ color: iconColor }}
      >
        {iconContent}
        <span className="text-[8px] font-bold tracking-[0.04em]">
          {iconLabel}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
      {badge}
    </div>
  );
}

// Badge variants map
const badgeStyles: Record<string, string> = {
  pending: "bg-[#F1EFE8] text-[#5F5E5A]",
  confirmed: "bg-[#E6F1FB] text-[#185FA5]",
  completed: "bg-[#E1F5EE] text-[#0F6E56]",
  cancelled: "bg-[#FCEBEB] text-[#A32D2D]",
  open: "bg-[#FAEEDA] text-[#854F0B]",
  progress: "bg-[#E6F1FB] text-[#185FA5]",
  resolved: "bg-[#E1F5EE] text-[#0F6E56]",
  active: "bg-[#EEEDFE] text-[#534AB7]",
  overdue: "bg-[#FCEBEB] text-[#A32D2D]",
};

function Badge({
  variant,
  label,
}: {
  variant: keyof typeof badgeStyles;
  label: string;
}) {
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
        badgeStyles[variant] ?? badgeStyles.pending
      }`}
    >
      {label}
    </span>
  );
}

function QuickBtn({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-start gap-1.5 cursor-pointer transition-colors hover:bg-muted/60 w-full text-left"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  users: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3" />
      <path d="M19 17c0-2.21-1.34-4-3-4" />
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
    </svg>
  ),
  calendar: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  package: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 10 6v8l-10 6L2 16V8z" />
      <path d="m12 22V12M2 8l10 4 10-4" />
    </svg>
  ),
  hanger: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 18H3.5l8.5-9 8.5 9z" />
      <path d="M12 9V3a2 2 0 0 1 2 2" />
    </svg>
  ),
  message: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  star: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  shirt: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  ),
  card: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  calendarPlus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M12 15v4M10 17h4" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  messageQuestion: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7v.01M12 11a1 1 0 0 1 0 2" />
    </svg>
  ),
  alert: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  calendarRow: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  packageRow: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 10 6v8l-10 6L2 16V8z" />
      <path d="m12 22V12M2 8l10 4 10-4" />
    </svg>
  ),
  hangerRow: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 18H3.5l8.5-9 8.5 9z" />
      <path d="M12 9V3a2 2 0 0 1 2 2" />
    </svg>
  ),
  messageRow: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "there";
  const token = session?.user?.backendToken ?? "";

  // ── greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ── data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    async function loadAll() {
      setLoading(true);

      try {
        const [
          customersRes,
          apptAllRes,
          apptPendingRes,
          ordersAllRes,
          rentalsActiveRes,
          rentalsOverdueRes,
          inquiriesAllRes,
          inquiriesOpenRes,
          reviewStatsRes,
          apptUpcomingRes,
          ordersRecentRes,
          inquiriesListRes,
          rentalsListRes,
        ] = await Promise.allSettled([
          listCustomers(token),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/appointments?size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/appointments?status=PENDING&size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/orders?size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/rentals?status=ACTIVE&size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/rentals?status=OVERDUE&size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/inquiries?size=1",
            {},
            token
          ),

          apiRequest<PaginatedResponse<unknown>>(
            "/api/inquiries?status=OPEN&size=1",
            {},
            token
          ),

          apiRequest<{ success?: boolean; data?: ReviewStatsResponse }>(
            "/api/reviews/stats",
            {},
            token
          ),

          apiRequest<PaginatedResponse<AppointmentResponse>>(
            "/api/appointments?size=4&sort=appointmentDate,asc",
            {},
            token
          ),

          apiRequest<PaginatedResponse<OrderResponse>>(
            "/api/orders?size=4&sort=createdAt,desc",
            {},
            token
          ),

          apiRequest<PaginatedResponse<InquiryResponse>>(
            "/api/inquiries?status=OPEN&size=4",
            {},
            token
          ),

          apiRequest<PaginatedResponse<RentalResponse>>(
            "/api/rentals?size=4&sort=rentalEnd,asc",
            {},
            token
          ),
        ]);

        const get = (
          res: PromiseSettledResult<{
            success?: boolean;
            pagination?: { total?: number };
            data?: any;
          }>,
          fallback = 0
        ) =>
          res.status === "fulfilled" && res.value?.success
            ? res.value.pagination?.total ?? res.value.data?.length ?? fallback
            : fallback;

        const reviewStats: ReviewStatsResponse | null =
          reviewStatsRes.status === "fulfilled" && reviewStatsRes.value?.success
            ? (reviewStatsRes.value.data as ReviewStatsResponse)
            : null;

        setStats({
          customers: get(customersRes),
          appointments: get(apptAllRes),
          pendingAppointments: get(apptPendingRes),
          orders: get(ordersAllRes),
          activeRentals: get(rentalsActiveRes),
          overdueRentals: get(rentalsOverdueRes),
          inquiries: get(inquiriesAllRes),
          openInquiries: get(inquiriesOpenRes),
          reviews: reviewStats?.totalReviews ?? 0,
          pendingReviews: reviewStats?.pendingReviews ?? 0,
          averageRating: reviewStats?.averageRating ?? 0,
        });

        if (
          apptUpcomingRes.status === "fulfilled" &&
          apptUpcomingRes.value.success
        ) {
          setAppointments(
            (apptUpcomingRes.value.data as unknown as AppointmentResponse[]) ??
              []
          );
        }

        if (
          ordersRecentRes.status === "fulfilled" &&
          ordersRecentRes.value.success
        ) {
          setOrders(
            (ordersRecentRes.value.data as unknown as OrderResponse[]) ?? []
          );
        }

        if (
          inquiriesListRes.status === "fulfilled" &&
          inquiriesListRes.value.success
        ) {
          setInquiries(
            (inquiriesListRes.value.data as unknown as InquiryResponse[]) ?? []
          );
        }

        if (
          rentalsListRes.status === "fulfilled" &&
          rentalsListRes.value.success
        ) {
          setRentals(
            (rentalsListRes.value.data as unknown as RentalResponse[]) ?? []
          );
        }
      } catch {
        setStats({
          customers: 0,
          appointments: 0,
          pendingAppointments: 0,
          orders: 0,
          activeRentals: 0,
          overdueRentals: 0,
          inquiries: 0,
          openInquiries: 0,
          reviews: 0,
          pendingReviews: 0,
          averageRating: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [token]);

  // ── helpers ───────────────────────────────────────────────────────────────

  const apptTypeLabel: Record<string, string> = {
    FITTING: "FIT",
    RENTAL_PICKUP: "PKP",
    PURCHASE: "BUY",
  };

  const apptTypeColor: Record<string, string> = {
    FITTING: "#534AB7",
    RENTAL_PICKUP: "#185FA5",
    PURCHASE: "#BA7517",
  };

  const orderStatusLabel: Record<string, string> = {
    CONFIRMED: "CNF",
    PENDING: "NEW",
    COMPLETED: "DON",
    CANCELLED: "CXL",
  };

  const orderStatusColor: Record<string, string> = {
    CONFIRMED: "#185FA5",
    PENDING: "#5F5E5A",
    COMPLETED: "#0F6E56",
    CANCELLED: "#A32D2D",
  };

  const inquiryStatusLabel: Record<string, string> = {
    OPEN: "NEW",
    IN_PROGRESS: "WIP",
    RESOLVED: "DON",
  };

  const inquiryStatusColor: Record<string, string> = {
    OPEN: "#BA7517",
    IN_PROGRESS: "#185FA5",
    RESOLVED: "#0F6E56",
  };

  const rentalStatusLabel: Record<string, string> = {
    ACTIVE: "ACT",
    OVERDUE: "OVR",
    RETURNED: "RET",
  };

  const rentalStatusColor: Record<string, string> = {
    ACTIVE: "#534AB7",
    OVERDUE: "#A32D2D",
    RETURNED: "#0F6E56",
  };

  function formatApptDate(dateStr: string, timeSlot: string) {
    const d = new Date(dateStr);
    const todayStr = new Date().toDateString();
    const tomorrowStr = new Date(Date.now() + 86400000).toDateString();

    const label =
      d.toDateString() === todayStr
        ? "Today"
        : d.toDateString() === tomorrowStr
          ? "Tomorrow"
          : d.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            });

    return (
      <>
        {label} · <span className="text-[#BA7517]">at {timeSlot}</span>
      </>
    );
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);

    if (h < 1) return "Just now";
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;

    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";

    return `${d} days ago`;
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-medium text-foreground">
          {greeting}, {firstName}
        </h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {today} · Here&apos;s what&apos;s happening at the boutique today.
        </p>
      </div>

      {/* ── Overview metrics row 1 ── */}
      <div>
        <SectionLabel>Overview</SectionLabel>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2.5">
          <MetricCard
            label="Customers"
            icon={Icon.users}
            value={stats?.customers ?? 0}
            sub={<span className="text-[#1D9E75]">↑ this month</span>}
            loading={loading}
          />

          <MetricCard
            label="Appointments"
            icon={Icon.calendar}
            value={stats?.appointments ?? 0}
            sub={
              <span style={{ color: "#EF9F27" }}>
                {stats?.pendingAppointments ?? 0} pending action
              </span>
            }
            loading={loading}
          />

          <MetricCard
            label="Orders"
            icon={Icon.package}
            value={stats?.orders ?? 0}
            sub={<span className="text-[#1D9E75]">this month</span>}
            loading={loading}
          />

          <MetricCard
            label="Active Rentals"
            icon={Icon.hanger}
            value={stats?.activeRentals ?? 0}
            sub={
              stats?.overdueRentals ? (
                <span style={{ color: "#E24B4A" }}>
                  {stats.overdueRentals} overdue
                </span>
              ) : (
                "all on time"
              )
            }
            loading={loading}
          />
        </div>

        {/* metrics row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <MetricCard
            label="Inquiries"
            icon={Icon.message}
            value={stats?.inquiries ?? 0}
            sub={
              <span>
                <span style={{ color: "#EF9F27" }}>
                  {stats?.openInquiries ?? 0} open
                </span>
              </span>
            }
            loading={loading}
          />

          <MetricCard
            label="Reviews"
            icon={Icon.star}
            value={stats?.reviews ? stats.averageRating.toFixed(1) : "—"}
            sub={
              <span>
                {stats?.reviews ?? 0} approved ·{" "}
                <span style={{ color: "#EF9F27" }}>
                  {stats?.pendingReviews ?? 0} pending
                </span>
              </span>
            }
            loading={loading}
          />

          <MetricCard
            label="Inventory"
            icon={Icon.shirt}
            value="—"
            sub="products active"
            loading={false}
          />

          <MetricCard
            label="Payments"
            icon={Icon.card}
            value="—"
            sub="pending settlement"
            loading={false}
          />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <SectionLabel>Quick actions</SectionLabel>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* <QuickBtn
            icon={Icon.calendarPlus}
            label="New appointment"
            sub="Schedule a fitting"
            onClick={() => router.push("/admin/appointments/new")}
          /> */}

          <QuickBtn
            icon={Icon.plus}
            label="Add product"
            sub="Inventory → new"
            onClick={() => router.push("/admin/inventory/new")}
          />

          <QuickBtn
            icon={Icon.messageQuestion}
            label="Reply to inquiry"
            sub={`${stats?.openInquiries ?? 0} awaiting reply`}
            onClick={() => router.push("/admin/inquiries")}
          />

          <QuickBtn
            icon={Icon.alert}
            label="Overdue rentals"
            sub={`${stats?.overdueRentals ?? 0} past return date`}
            onClick={() => router.push("/admin/rentals?status=OVERDUE")}
          />
        </div>
      </div>

      {/* ── Appointments + Orders ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Upcoming appointments */}
        <CardShell
          title="Upcoming appointments"
          onViewAll={() => router.push("/admin/appointments")}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-border/50 last:border-b-0 flex items-center gap-2.5"
              >
                <Skeleton className="w-[34px] h-[42px] rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : appointments.length > 0 ? (
            appointments.map((appt) => (
              <RowItem
                key={appt.id}
                iconContent={Icon.calendarRow}
                iconColor={apptTypeColor[appt.type] ?? "#534AB7"}
                iconLabel={apptTypeLabel[appt.type] ?? "APT"}
                title={appt.customerName ?? appt.customerEmail ?? "—"}
                sub={formatApptDate(appt.appointmentDate, appt.timeSlot)}
                badge={
                  <Badge
                    variant={
                      appt.status.toLowerCase() as keyof typeof badgeStyles
                    }
                    label={
                      appt.status.charAt(0) +
                      appt.status.slice(1).toLowerCase()
                    }
                  />
                }
              />
            ))
          ) : (
            <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">
              No upcoming appointments
            </p>
          )}
        </CardShell>

        {/* Recent orders */}
        <CardShell
          title="Recent orders"
          onViewAll={() => router.push("/admin/orders")}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-border/50 last:border-b-0 flex items-center gap-2.5"
              >
                <Skeleton className="w-[34px] h-[42px] rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <RowItem
                key={order.id}
                iconContent={Icon.packageRow}
                iconColor={orderStatusColor[order.status] ?? "#5F5E5A"}
                iconLabel={orderStatusLabel[order.status] ?? "NEW"}
                title={`#${order.id.slice(0, 8).toUpperCase()}`}
                sub={
                  <>
                    {order.customerFirstName} {order.customerLastName} ·{" "}
                    <span className="text-[#BA7517]">
                      LKR {order.totalAmount.toLocaleString()}
                    </span>
                  </>
                }
                badge={
                  <Badge
                    variant={
                      order.status.toLowerCase() as keyof typeof badgeStyles
                    }
                    label={
                      order.status.charAt(0) +
                      order.status.slice(1).toLowerCase()
                    }
                  />
                }
              />
            ))
          ) : (
            <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">
              No recent orders
            </p>
          )}
        </CardShell>
      </div>

      {/* ── Inquiries + Rentals ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Open inquiries */}
        <CardShell
          title="Open inquiries"
          onViewAll={() => router.push("/admin/inquiries")}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-border/50 last:border-b-0 flex items-center gap-2.5"
              >
                <Skeleton className="w-[34px] h-[42px] rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : inquiries.length > 0 ? (
            inquiries.map((inq) => (
              <RowItem
                key={inq.id}
                iconContent={Icon.messageRow}
                iconColor={inquiryStatusColor[inq.status] ?? "#BA7517"}
                iconLabel={inquiryStatusLabel[inq.status] ?? "NEW"}
                title={inq.subject ?? inq.message.slice(0, 32)}
                sub={`${inq.name} · ${timeAgo(inq.createdAt)}`}
                badge={
                  <Badge
                    variant={
                      inq.status === "IN_PROGRESS"
                        ? "progress"
                        : (inq.status.toLowerCase() as keyof typeof badgeStyles)
                    }
                    label={
                      inq.status === "IN_PROGRESS"
                        ? "In Progress"
                        : inq.status.charAt(0) +
                          inq.status.slice(1).toLowerCase()
                    }
                  />
                }
              />
            ))
          ) : (
            <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">
              No open inquiries
            </p>
          )}
        </CardShell>

        {/* Active rentals */}
        <CardShell
          title="Active rentals"
          onViewAll={() => router.push("/admin/rentals")}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border-b border-border/50 last:border-b-0 flex items-center gap-2.5"
              >
                <Skeleton className="w-[34px] h-[42px] rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : rentals.length > 0 ? (
            rentals.map((rental) => {
              const dueDate = new Date(rental.rentalEnd);
              const isOverdue = rental.status === "OVERDUE";
              const dueDateStr = dueDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              });

              return (
                <RowItem
                  key={rental.id}
                  iconContent={Icon.hangerRow}
                  iconColor={rentalStatusColor[rental.status] ?? "#534AB7"}
                  iconLabel={rentalStatusLabel[rental.status] ?? "ACT"}
                  title={rental.productName ?? "—"}
                  sub={
                    <>
                      {rental.customerName} ·{" "}
                      <span
                        style={{ color: isOverdue ? "#E24B4A" : undefined }}
                      >
                        Due {dueDateStr}
                      </span>
                    </>
                  }
                  badge={
                    <Badge
                      variant={
                        rental.status === "OVERDUE"
                          ? "overdue"
                          : (rental.status.toLowerCase() as keyof typeof badgeStyles)
                      }
                      label={
                        rental.status === "OVERDUE"
                          ? "Overdue"
                          : rental.status.charAt(0) +
                            rental.status.slice(1).toLowerCase()
                      }
                    />
                  }
                />
              );
            })
          ) : (
            <p className="px-4 py-6 text-[12px] text-muted-foreground text-center">
              No active rentals
            </p>
          )}
        </CardShell>
      </div>
    </div>
  );
}