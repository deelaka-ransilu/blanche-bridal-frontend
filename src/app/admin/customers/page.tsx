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

type TabFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdminCustomersPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listCustomers(token).then((res) => {
      if (res.success && res.data) setCustomers(res.data);
      setLoading(false);
    });
  }, [token]);

  // ── Counts ───────────────────────────────────────────────────────────────────
  const activeCount   = customers.filter((c) => c.isActive).length;
  const inactiveCount = customers.filter((c) => !c.isActive).length;

  const tabCount: Record<TabFilter, number> = {
    ALL:      customers.length,
    ACTIVE:   activeCount,
    INACTIVE: inactiveCount,
  };

  // ── Filter by tab then by search ─────────────────────────────────────────────
  const byTab =
    tab === "ALL"
      ? customers
      : customers.filter((c) => (tab === "ACTIVE" ? c.isActive : !c.isActive));

  const filtered = byTab.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    );
  });

  // ── Toggle active / inactive ─────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Customers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading
            ? "Loading…"
            : `${customers.length} registered · ${activeCount} active`}
        </p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
          {(["ALL", "ACTIVE", "INACTIVE"] as TabFilter[]).map((t) => {
            const count = tabCount[t];
            const badgeCls =
              t === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : t === "INACTIVE"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600";

            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
                  tab === t
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((customer) => {
              const isMuted = !customer.isActive;

              return (
                <div
                  key={customer.id}
                  className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isMuted ? "bg-gray-100" : "bg-amber-100"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold ${
                        isMuted ? "text-gray-400" : "text-amber-700"
                      }`}
                    >
                      {customer.firstName[0]}{customer.lastName[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + status badge */}
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span
                        className={`text-sm font-medium ${
                          isMuted ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {customer.firstName} {customer.lastName}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          customer.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Email */}
                    <p className={`text-xs truncate ${isMuted ? "text-gray-300" : "text-muted-foreground"}`}>
                      {customer.email}
                    </p>

                    {/* Phone + joined */}
                    <p className={`text-xs mt-0.5 ${isMuted ? "text-gray-300" : "text-muted-foreground"}`}>
                      {customer.phone && <span>{customer.phone} · </span>}
                      Joined{" "}
                      {new Date(customer.createdAt).toLocaleDateString("en-LK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actioningId === customer.id}
                          className={`h-7 text-xs px-2.5 ${
                            customer.isActive
                              ? "text-red-600 border-red-200 hover:bg-red-50"
                              : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={customer.isActive ? ToggleOffIcon : ToggleOnIcon}
                            strokeWidth={2}
                            className="size-3.5 mr-1"
                          />
                          {actioningId === customer.id
                            ? "…"
                            : customer.isActive
                            ? "Deactivate"
                            : "Activate"}
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
                            className={
                              customer.isActive
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }
                            onClick={() => handleToggle(customer)}
                          >
                            Yes, {customer.isActive ? "Deactivate" : "Activate"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}