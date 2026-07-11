"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const dashboardPathByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CUSTOMER: "/my/dashboard",
};

export function PublicNav() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as string | undefined;
  const dashboardPath = role ? dashboardPathByRole[role] ?? "/my/dashboard" : "/my/dashboard";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const initial = firstName ? firstName[0].toUpperCase() : "?";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-2xl items-center justify-between rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
        <Link
          href="/"
          className="font-heading pl-2 text-base font-medium text-foreground"
        >
          Blanche Bridal
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/products"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/contact"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Contact
          </Link>
        </div>

        <div className="flex items-center pr-0.5">
          {status === "loading" ? (
            <div className="h-8 w-8" />
          ) : session ? (
            <Link
              href={dashboardPath}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90"
              title="Go to dashboard"
            >
              {initial}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}