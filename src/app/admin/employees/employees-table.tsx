"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEmployeeAction,
  activateEmployeeAction,
  deactivateEmployeeAction,
} from "./actions";
import type { AdminUser, CreateUserInput } from "@/types/admin";

export function EmployeesTable({
  initialEmployees,
}: {
  initialEmployees: AdminUser[];
}) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<CreateUserInput>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createEmployeeAction(form);
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data) setEmployees((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ email: "", password: "", firstName: "", lastName: "", phone: "" });
    });
  }

  function handleToggle(emp: AdminUser) {
    setError(null);
    startTransition(async () => {
      const res = emp.active
        ? await deactivateEmployeeAction(emp.id)
        : await activateEmployeeAction(emp.id);
      if (!res.success) {
        setError(res.message);
        return;
      }
      if (res.data) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === emp.id ? res.data! : e)),
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={() => setShowForm((s) => !s)}>
        {showForm ? "Cancel" : "Add Employee"}
      </Button>

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 max-w-md border rounded-lg p-4">
          {(["firstName", "lastName", "email", "phone", "password"] as const).map(
            (field) => (
              <div key={field} className="grid gap-1">
                <Label htmlFor={field}>{field}</Label>
                <Input
                  id={field}
                  type={field === "password" ? "password" : "text"}
                  value={form[field]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                  required
                />
              </div>
            ),
          )}
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
          {employees.map((emp) => (
            <tr key={emp.id} className="border-b">
              <td className="py-2">
                {emp.firstName} {emp.lastName}
              </td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.active ? "Active" : "Inactive"}</td>
              <td>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggle(emp)}
                >
                  {emp.active ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}