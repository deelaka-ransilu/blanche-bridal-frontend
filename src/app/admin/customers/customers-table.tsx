"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWalkInAction,
  activateCustomerAction,
  deactivateCustomerAction,
} from "./actions";
import type { AdminUser, CreateWalkInInput } from "@/types/admin";

export function CustomersTable({
  initialCustomers,
}: {
  initialCustomers: AdminUser[];
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CreateWalkInInput>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createWalkInAction(form);
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data) setCustomers((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ email: "", firstName: "", lastName: "", phone: "" });
    });
  }

  function handleToggle(cust: AdminUser) {
    setError(null);
    startTransition(async () => {
      const res = cust.active
        ? await deactivateCustomerAction(cust.id)
        : await activateCustomerAction(cust.id);
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === cust.id ? res.data! : c)),
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={() => setShowForm((s) => !s)}>
        {showForm ? "Cancel" : "Add Walk-In Customer"}
      </Button>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 max-w-md border rounded-lg p-4">
          {(["firstName", "lastName", "email", "phone"] as const).map((field) => (
            <div key={field} className="grid gap-1">
              <Label htmlFor={field}>{field}</Label>
              <Input
                id={field}
                value={form[field]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [field]: e.target.value }))
                }
                required
              />
            </div>
          ))}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create"}
          </Button>
        </form>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust.id} className="border-b">
              <td className="py-2">
                <Link
                  href={`/admin/customers/${cust.id}`}
                  className="underline underline-offset-2"
                >
                  {cust.firstName} {cust.lastName}
                </Link>
              </td>
              <td>{cust.email}</td>
              <td>{cust.phone}</td>
              <td>{cust.active ? "Active" : "Inactive"}</td>
              <td>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggle(cust)}
                >
                  {cust.active ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}