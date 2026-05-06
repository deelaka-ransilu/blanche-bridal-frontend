"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { listCustomers } from "@/lib/api/auth";
import { User } from "@/types";
import { activateCustomer, deactivateCustomer } from "@/lib/api/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ToggleOnIcon, ToggleOffIcon } from "@hugeicons/core-free-icons";

export default function AdminCustomersPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listCustomers(token).then((res) => {
      if (res.success && res.data) setCustomers(res.data);
      setLoading(false);
    });
  }, [token]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    );
  });

  async function handleToggle(customer: User) {
  if (!token) return;
  setActioningId(customer.id);
  try {
    const res = customer.isActive
      ? await deactivateCustomer(token, customer.id)
      : await activateCustomer(token, customer.id);
    if (res.success && res.data) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? res.data! : c)),
      );
    }
  } catch {
    console.error("Toggle failed");
  } finally {
    setActioningId(null);
  }
}

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading..." : `${customers.length} registered customers`}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.5}
              className="size-6 text-gray-400"
            />
          </div>
          <p className="font-medium text-gray-900">
            {search ? "No customers match your search" : "No customers yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try a different name, email or phone number."
              : "Customers will appear here once they register."}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              {/* Avatar + info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-amber-700">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground">
                      {customer.phone}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Right — status + toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    customer.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actioningId === customer.id}
                      className={customer.isActive
                        ? "text-red-600 border-red-200 hover:bg-red-50"
                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
                    >
                      <HugeiconsIcon
                        icon={customer.isActive ? ToggleOffIcon : ToggleOnIcon}
                        strokeWidth={2}
                        className="size-4 mr-1.5"
                      />
                      {customer.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {customer.isActive ? "Deactivate" : "Activate"} {customer.firstName}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {customer.isActive
                          ? `${customer.firstName} will lose access to the system immediately.`
                          : `${customer.firstName} will regain access to the system.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={customer.isActive
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        onClick={() => handleToggle(customer)}
                      >
                        Yes, {customer.isActive ? "Deactivate" : "Activate"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}