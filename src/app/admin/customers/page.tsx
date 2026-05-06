"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, ToggleOnIcon, ToggleOffIcon } from "@hugeicons/core-free-icons";
import { listCustomers, activateCustomer, deactivateCustomer } from "@/lib/api/auth";
import { User } from "@/types";
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading..." : `${customers.length} registered customers`}
            </p>
          </div>
        </div>
        {/* Search — full width on mobile */}
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="size-6 text-gray-400" />
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
            <div key={customer.id} className="px-4 sm:px-5 py-3 sm:py-4">

              {/* Top row: avatar + name + status badge */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-amber-700">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + badge on same line */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      customer.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Email + phone + joined */}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {customer.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {customer.phone && <span>{customer.phone} · </span>}
                    Joined{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  {/* Action button below info on mobile */}
                  <div className="mt-2.5">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actioningId === customer.id}
                          className={`h-7 text-xs ${customer.isActive
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                        >
                          <HugeiconsIcon
                            icon={customer.isActive ? ToggleOffIcon : ToggleOnIcon}
                            strokeWidth={2}
                            className="size-3.5 mr-1"
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}