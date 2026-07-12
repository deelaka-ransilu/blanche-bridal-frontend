"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Bell } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";

const PRIMARY_LINKS = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/users", label: "Users" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export function AdminTopnav({
  userName,
  notifications,
}: {
  userName: string;
  notifications: NotificationItem[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="sticky top-3 z-30 mx-auto mb-8 max-w-5xl px-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-lg">
        {/* Left: user avatar */}
        <div className="relative shrink-0">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-primary/5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
              {initials || "A"}
            </div>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute left-0 z-50 mt-2 w-36 rounded-lg border border-border bg-card p-1.5 shadow-lg">
                <SignOutButton />
              </div>
            </>
          )}
        </div>

        {/* Center: nav tabs (desktop) — flat, no More dropdown */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Right: search + notifications */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="relative flex items-center">
            {searchOpen ? (
              <input
                autoFocus
                type="text"
                placeholder="Search orders, customers, products…"
                onBlur={() => setSearchOpen(false)}
                className="w-48 rounded-lg border border-border bg-background py-1.5 px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 sm:w-56"
              />
            ) : (
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/5"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-primary/5"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-card p-1.5 shadow-lg">
                  <p className="px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground">
                    Notifications
                  </p>
                  {notifications.length === 0 ? (
                    <p className="px-2.5 py-3 text-[13px] text-muted-foreground">
                      Nothing new.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => setNotifOpen(false)}
                          className="block rounded-md px-2.5 py-2 hover:bg-primary/5"
                        >
                          <p className="text-[13px] text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground">{n.subtitle}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-svh w-64 flex-col bg-card p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-heading px-2 text-base font-medium text-foreground">Menu</p>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {PRIMARY_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-2 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-primary/12 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}