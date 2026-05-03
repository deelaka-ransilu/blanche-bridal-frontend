"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartIcon } from "@/components/shared/CartIcon";
import { CartDrawer } from "@/components/shared/CartDrawer";

const navLinks = [
  { label: "Shop",         href: "/catalog" },
  { label: "Book Fitting", href: "/booking" },
  { label: "Inquiry",      href: "/inquiry" },
];

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPERADMIN": return "/superadmin/dashboard";
    case "ADMIN":      return "/admin/dashboard";
    case "EMPLOYEE":   return "/employee/dashboard";
    default:           return "/my/dashboard";
  }
}

function getCustomerLinks(role: string) {
  if (role === "CUSTOMER") {
    return [
      { label: "Dashboard",    href: "/my/dashboard" },
      { label: "Orders",       href: "/my/orders" },
      { label: "Rentals",      href: "/my/rentals" },
      { label: "Appointments", href: "/my/appointments" },
      { label: "Profile",      href: "/my/profile" },
    ];
  }
  return [
    { label: "Dashboard", href: getDashboardUrl(role) },
    { label: "Profile",   href: `/${role.toLowerCase()}/settings` },
  ];
}

export function PublicNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "";
  const initials = firstName.charAt(0).toUpperCase();
  const role = session?.user?.role ?? "CUSTOMER";
  const accountLinks = getCustomerLinks(role);

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b border-bridal-gold/20 bg-bridal-bg/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 md:px-8 lg:px-12">

          {/* ── Brand wordmark ── */}
          <Link href="/" className="shrink-0 leading-none">
            <span className="block font-jost text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-bridal-text md:text-sm">
              Blanche
            </span>
            <span className="block font-jost text-[0.42rem] font-semibold uppercase tracking-[0.3em] text-bridal-muted md:text-[0.46rem]">
              Bridal Couture
            </span>
          </Link>

          {/* ── Center nav links (desktop) ── */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-jost text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
                    isActive
                      ? "text-bridal-gold"
                      : "text-bridal-text/60 hover:text-bridal-gold"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-px bg-bridal-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right slot ── */}
          <div className="flex items-center gap-3">
            {/* Cart — always visible */}
            <CartIcon />

            {/* Loading placeholder — prevents layout shift */}
            {loading && <div className="h-8 w-8" />}

            {/* Logged out */}
            {!loading && !session && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="font-jost text-[0.6rem] font-bold uppercase tracking-[0.14em] text-bridal-text/60 transition-colors duration-200 hover:text-bridal-gold"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="border border-bridal-gold/50 px-4 py-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.14em] text-bridal-gold transition-all duration-200 hover:bg-bridal-gold hover:text-white"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Logged in — avatar dropdown */}
            {!loading && session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-bridal-gold font-jost text-xs font-bold text-white transition-opacity duration-200 hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-bridal-gold/50 focus:ring-offset-2"
                  >
                    {initials}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-52 border-bridal-gold/20 bg-[#faf6f1] shadow-[0_8px_32px_rgba(23,16,12,0.12)]"
                >
                  {/* User info header */}
                  <div className="px-3 py-2.5">
                    <p className="font-jost text-xs font-semibold text-bridal-text truncate">
                      {firstName}
                    </p>
                    <p className="font-jost text-[0.65rem] text-bridal-muted truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="bg-bridal-gold/15" />

                  {accountLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="cursor-pointer font-jost text-xs text-bridal-text hover:text-bridal-gold focus:text-bridal-gold"
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-bridal-gold/15" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="cursor-pointer font-jost text-xs text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span className="h-px w-5 bg-bridal-text transition-all" />
              <span className="h-px w-5 bg-bridal-text transition-all" />
              <span className="h-px w-3.5 bg-bridal-text transition-all" />
            </button>
          </div>

        </div>
      </header>

      {/* Cart drawer — outside header so it overlays full page */}
      <CartDrawer />
    </>
  );
}