import Link from "next/link";
import { AppointmentsView } from "@/components/bookings/appointments-view";
import { InquiriesView } from "@/components/bookings/inquiries-view";

const TABS = [
  { key: "appointments", label: "Appointments" },
  { key: "inquiries", label: "Inquiries" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab: TabKey = tab === "inquiries" ? "inquiries" : "appointments";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-medium text-foreground">Bookings</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/bookings?tab=${t.key}`}
              className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                activeTab === t.key
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/5"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {activeTab === "appointments" ? <AppointmentsView /> : <InquiriesView />}
    </div>
  );
}