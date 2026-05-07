"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronRight, Plus, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminApiError, getCustomers } from "@/lib/api/customers";
import type { User } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAdminRole = useMemo(() => {
    const role = session?.user?.role;
    return role === "ADMIN" || role === "SUPERADMIN";
  }, [session?.user?.role]);

  async function handleAuthError() {
    await signOut({ callbackUrl: "/login" });
  }

  useEffect(() => {
    if (status === "loading") return;
    if (!token || !isAdminRole) {
      router.replace("/login");
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    getCustomers(token)
      .then((data) => {
        if (!active) return;
        setCustomers(data ?? []);
      })
      .catch(async (caughtError) => {
        if (!active) return;

        if (caughtError instanceof AdminApiError && (caughtError.status === 401 || caughtError.status === 403)) {
          await handleAuthError();
          return;
        }

        setError("Failed to load customers.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdminRole, router, status, token]);

  const filtered = customers.filter((customer) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [customer.firstName, customer.lastName, customer.email, customer.phone ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const activeCount = customers.filter((customer) => customer.isActive).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-24 rounded-3xl bg-muted animate-pulse" />
        <div className="h-12 rounded-3xl bg-muted animate-pulse" />
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-24 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Manage Customers
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Search, open, and update customer records</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Search by name, email, or phone. Open a customer profile to add notes, design inspiration URLs, and measurement history, or register a new walk-in customer.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/admin/customers/new")} className="gap-2">
            <Plus className="size-4" />
            New Walk-in Customer
          </Button>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm text-muted-foreground">Registered customers</p>
            <p className="text-2xl font-semibold text-foreground">{customers.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active accounts</p>
            <p className="text-2xl font-semibold text-foreground">{activeCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Search results</p>
            <p className="text-2xl font-semibold text-foreground">{filtered.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, email, or phone"
          className="h-11 rounded-3xl pl-11"
        />
        {search && <span className="text-xs text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2">Found: {filtered.length}</span>}
      </div>

      {error ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{search ? "No matching customers" : "No customers found"}</CardTitle>
            <CardDescription>
              {search
                ? "Try a different name, email, or phone number. If the person is not registered, create a walk-in customer instead."
                : "Walk-in customers can be created directly from this page."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {search && (
              <Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
              className="group w-full rounded-3xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-foreground">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <Badge variant={customer.isActive ? "default" : "destructive"}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                    <span className="truncate">{customer.email}</span>
                    <span>{customer.phone || "No phone provided"}</span>
                    <span>Joined {formatDate(customer.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Open profile
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}