"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";

const dashboardPathByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CUSTOMER: "/my/dashboard",
};

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/rent", label: "Rent" },
  { href: "/custom-design", label: "Custom Design & Gallery" },
];

export function PublicNav() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4">
      <nav className="flex w-full max-w-2xl items-center justify-between rounded-full border border-border bg-card px-4 py-2.5 shadow-lg">
        <Link href="/" className="flex items-center gap-2 pl-1">
          <Image src="/logo.png" alt="Blanche Bridal" width={32} height={32} className="rounded-full" priority />
          <span className="font-heading hidden text-sm font-semibold text-foreground sm:inline">
            Blanche Bridal
          </span>
        </Link>

        {/* Desktop links — hidden below md */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 pr-0.5">
          {/* Hamburger — only below md */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

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

      {/* Mobile dropdown links */}
      {mobileNavOpen && (
        <div className="mt-2 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}