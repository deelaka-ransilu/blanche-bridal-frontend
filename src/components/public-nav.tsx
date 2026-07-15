"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";

const dashboardPathByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CUSTOMER: "/my/dashboard",
};

export function PublicNav() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role as string | undefined;
  const dashboardPath = role ? dashboardPathByRole[role] ?? "/my/dashboard" : "/my/dashboard";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const initial = firstName ? firstName[0].toUpperCase() : "?";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-2xl items-center justify-between rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
        <Link href="/" className="flex items-center gap-2 pl-1">
          <Image
            src="/logo.png"
            alt="Blanche Bridal"
            width={32}
            height={32}
            className="rounded-full"
            priority
          />
          <span className="font-heading hidden text-sm font-semibold text-foreground sm:inline">
            Blanche Bridal
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/products"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/rent"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Rent
          </Link>
          <Link
            href="/custom-design"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Custom Design & Gallery
          </Link>
        </div>

        <div className="flex items-center gap-1 pr-0.5">
          {status === "loading" ? (
            <div className="h-8 w-8" />
          ) : session ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 items-center gap-1 rounded-full bg-primary pl-1 pr-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  {initial}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <Link
                    href={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
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