"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { listCustomers } from "@/lib/api/auth";
import { User } from "@/types";

export default function AdminCustomersPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

              {/* Right — status + joined date */}
              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      customer.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}