"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
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
  { label: "Collections", href: "/#collections" },
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

function getAccountLinks(role: string) {
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

interface PublicNavProps {
  /** Pass true on the landing page — renders transparent over the hero image */
  transparent?: boolean;
}

export function PublicNav({ transparent = false }: PublicNavProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On transparent mode, switch to solid after scrolling past the hero
  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "";
  const initials = firstName.charAt(0).toUpperCase();
  const role = session?.user?.role ?? "CUSTOMER";
  const accountLinks = getAccountLinks(role);

  /* ── Derived style state ── */
  const isTransparent = transparent && !scrolled;

  const headerClass = isTransparent
    ? "fixed top-0 left-0 right-0 z-50 border-b border-bridal-text/10 bg-[#f7efe4]/25 backdrop-blur-[2px] transition-all duration-300"
    : transparent && scrolled
      ? "fixed top-0 left-0 right-0 z-50 border-b border-bridal-gold/20 bg-bridal-bg/95 backdrop-blur-md transition-all duration-300"
      : "sticky top-0 z-50 border-b border-bridal-gold/20 bg-bridal-bg/95 backdrop-blur-md";

  const linkBase =
    "font-jost text-[0.6rem] font-bold uppercase tracking-[0.14em] transition-colors duration-200";
  const linkActive = "text-bridal-gold";
  const linkInactive = isTransparent
    ? "text-bridal-text/70 hover:text-bridal-gold"
    : "text-bridal-text/60 hover:text-bridal-gold";

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 md:px-8 lg:px-12">

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
              const isActive =
                link.href !== "/#collections" &&
                (pathname === link.href ||
                  pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative ${linkBase} ${isActive ? linkActive : linkInactive}`}
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

            {/* Loading placeholder */}
            {loading && <div className="h-8 w-8" />}

            {/* Logged out — desktop only */}
            {!loading && !session && (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/login"
                  className={`${linkBase} ${linkInactive}`}
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

            {/* Logged in — avatar dropdown, desktop only */}
            {!loading && session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="hidden h-8 w-8 items-center justify-center rounded-full bg-bridal-gold font-jost text-xs font-bold text-white transition-opacity duration-200 hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-bridal-gold/50 focus:ring-offset-2 md:flex"
                  >
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 border-bridal-gold/20 bg-[#faf6f1] shadow-[0_8px_32px_rgba(23,16,12,0.12)]"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate font-jost text-xs font-semibold text-bridal-text">
                      {firstName}
                    </p>
                    <p className="truncate font-jost text-[0.65rem] text-bridal-muted">
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

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span className="h-px w-5 bg-bridal-text transition-all" />
              <span className="h-px w-5 bg-bridal-text transition-all" />
              <span className="h-px w-3.5 bg-bridal-text transition-all" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-out drawer ── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-bridal-dark/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-[70] flex h-full w-[80vw] max-w-xs flex-col bg-bridal-bg transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-bridal-gold/20 px-5 py-4">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="leading-none"
          >
            <span className="block font-jost text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-bridal-text">
              Blanche
            </span>
            <span className="block font-jost text-[0.42rem] font-semibold uppercase tracking-[0.3em] text-bridal-muted">
              Bridal Couture
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center text-bridal-text/60 transition-colors hover:text-bridal-text"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-5 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="border-b border-bridal-gold/10 py-3.5 font-jost text-[0.65rem] font-bold uppercase tracking-[0.2em] text-bridal-text/70 transition-colors hover:text-bridal-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="mt-auto px-5 pb-8">
          <div className="mb-5 h-px bg-bridal-gold/20" />

          {!loading && !session && (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="py-3 font-jost text-[0.65rem] font-bold uppercase tracking-[0.2em] text-bridal-text/70 transition-colors hover:text-bridal-gold"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center justify-center border border-bridal-gold/50 px-5 py-3 font-jost text-[0.58rem] font-bold uppercase tracking-[0.14em] text-bridal-gold transition-all hover:bg-bridal-gold hover:text-white"
              >
                Register
              </Link>
            </div>
          )}

          {!loading && session && (
            <div className="flex flex-col gap-1">
              <p className="mb-3 font-jost text-xs font-semibold text-bridal-text">
                {firstName}
              </p>
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="py-2.5 font-jost text-[0.62rem] font-bold uppercase tracking-[0.16em] text-bridal-text/65 transition-colors hover:text-bridal-gold"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="mt-4 py-2.5 text-left font-jost text-[0.62rem] font-bold uppercase tracking-[0.16em] text-red-500 transition-colors hover:text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer — outside header so it overlays full page */}
      <CartDrawer />
    </>
  );
}