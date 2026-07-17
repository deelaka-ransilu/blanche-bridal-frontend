import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getEmployees } from "@/lib/api/employees";
import { redirectIfAuthError } from "@/lib/api/guards";
import { EmployeeStatusButton } from "@/components/employees/employee-status-button";

// NOTE: there's no GET /api/admin/employees/{id} on the backend yet — only
// the list endpoint. Rather than add a backend endpoint for this, we reuse
// getEmployees() and find the match here. If this page needs to show more
// than the list already carries (e.g. an employee-side profile/notes,
// mirroring CustomerProfile), that'll need a real detail endpoint.
export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEmployees();
  redirectIfAuthError(result);

  if (!result.success) {
    notFound();
  }

  const employee = result.data.find((e) => e.id === id);

  if (!employee) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to users
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-xl font-medium text-foreground">
              {employee.firstName} {employee.lastName}
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                employee.active
                  ? "bg-status-completed/10 text-status-completed"
                  : "bg-status-cancelled/10 text-status-cancelled"
              }`}
            >
              {employee.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {employee.email}
            {employee.phone ? ` · ${employee.phone}` : ""}
          </p>
        </div>
        <EmployeeStatusButton employeeId={employee.id} active={employee.active} />
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-sm text-muted-foreground">
          No additional employee details yet — this mirrors what&apos;s on the users list.
          If you want notes, assigned orders, or other detail here, that&apos;s a bigger
          addition (probably wants its own backend endpoint, similar to how
          CustomerProfile backs the customer detail page).
        </p>
      </div>
    </div>
  );
}