import { listEmployees } from "@/lib/api/auth-server";
import { EmployeesTable } from "./employees-table";

export default async function EmployeesPage() {
  const res = await listEmployees();

  if (!res.success) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load employees: {res.message}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Employees</h1>
      <EmployeesTable initialEmployees={res.data ?? []} />
    </div>
  );
}