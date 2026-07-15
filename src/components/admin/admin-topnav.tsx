"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";

const PRIMARY_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function currentPageLabel(pathname: string): string | null {
  const match = PRIMARY_LINKS.find((l) => isActive(pathname, l.href));
  return match?.label ?? null;
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!notifOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageLabel = currentPageLabel(pathname);

  return (
    <div className="sticky top-3 z-30 mx-auto mb-8 max-w-5xl px-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-lg lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        {/* Left: user avatar + mobile page label, grouped together */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:justify-self-start">
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
                <div className="absolute left-0 z-50 mt-2 w-52 rounded-lg border border-border bg-card p-1.5 shadow-lg">
              <div className="hidden items-center justify-center gap-1 lg:flex lg:justify-self-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
                      {initials || "A"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{userName}</p>
                      <p className="text-[11px] text-muted-foreground">Admin</p>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-border" />

                  <Link
                    href="/admin/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="block rounded-md px-2.5 py-2 text-[13px] text-foreground hover:bg-primary/5"
                  >
                    Profile settings
                  </Link>

                  <div className="my-1 h-px bg-border" />

                  <SignOutButton variant="menu" />
                </div>
              </>
            )}
          </div>

          {/* Mobile page label, left-aligned next to the avatar */}
          {pageLabel && (
            <span className="truncate text-sm font-medium text-foreground lg:hidden">
              {pageLabel}
            </span>
          )}
        </div>

        {/* Center: nav tabs (desktop) */}
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

        {/* Right: notifications */}
        <div className="relative flex shrink-0 items-center gap-1.5 lg:justify-self-end">
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

        </div>
      </div>

      {/* Notifications: centered modal, matching CustomerModal/EmployeeModal style */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setNotifOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-base font-medium text-foreground">
                Notifications
              </h2>
              <button
                aria-label="Close notifications"
                onClick={() => setNotifOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-6 w-6 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nothing needs your attention.</p>
              </div>
            ) : (
              <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setNotifOpen(false)}
                    className="rounded-xl border border-border px-3.5 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{n.subtitle}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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