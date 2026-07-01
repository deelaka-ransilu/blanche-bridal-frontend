import Link from "next/link";
import { listCustomers } from "@/lib/api/auth-server";
import { CustomersTable } from "./customers-table";

export default async function CustomersPage() {
  const res = await listCustomers();

  if (!res.success) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load customers: {res.message}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <CustomersTable initialCustomers={res.data ?? []} />
    </div>
  );
}