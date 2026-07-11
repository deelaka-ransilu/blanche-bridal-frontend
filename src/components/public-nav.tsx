"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

const dashboardPathByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CUSTOMER: "/my/dashboard",
};

export function PublicNav() {
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const role = session?.user?.role as string | undefined;
  const dashboardPath = role ? dashboardPathByRole[role] ?? "/my/dashboard" : "/my/dashboard";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const initial = firstName ? firstName[0].toUpperCase() : "?";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-2xl items-center justify-between rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
        <Link href="/" className="flex items-center pl-1">
        <Image
          src="/logo.png"
          alt="Blanche Bridal"
          width={32}
          height={32}
          className="rounded-full"
          priority
        />
      </Link>

        <div className="flex items-center gap-1">
          <Link
          href="/about"
          className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          About
        </Link>
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
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-2 pr-0.5">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

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