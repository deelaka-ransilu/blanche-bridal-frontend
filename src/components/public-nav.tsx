"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, LayoutDashboard, ShoppingBag, Settings, Ruler } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

const dashboardPathByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CUSTOMER: "/my/dashboard",
};

export function PublicNav() {
  const { data: session, status } = useSession();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role as string | undefined;
  const dashboardPath = role ? dashboardPathByRole[role] ?? "/my/dashboard" : "/my/dashboard";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const initial = firstName ? firstName[0].toUpperCase() : "?";
  const isCustomer = role === "CUSTOMER";

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
            href="/gallery"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Gallery
          </Link>
          <Link
            href="/products"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Products
          </Link>
        </div>

        <div className="flex items-center gap-1 pr-0.5">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

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
                  {isCustomer && (
                    <>
                      <Link
                        href="/my/measurements"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent"
                      >
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        Measurements
                      </Link>
                      <Link
                        href="/my/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-foreground hover:bg-accent"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </Link>
                    </>
                  )}
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