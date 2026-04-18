"use client";

import Link from "next/link";
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

// Role → dashboard URL
function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "/superadmin/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "EMPLOYEE":
      return "/employee/dashboard";
    case "CUSTOMER":
    default:
      return "/my/profile";
  }
}

// Role → profile URL
function getProfileUrl(role: string): string {
  switch (role) {
    case "CUSTOMER":
      return "/my/profile";
    case "ADMIN":
      return "/admin/settings";
    case "EMPLOYEE":
      return "/employee/settings";
    case "SUPERADMIN":
      return "/superadmin/settings";
    default:
      return "/my/profile";
  }
}

export function PublicNav() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "";
  const initials = firstName.charAt(0).toUpperCase();
  const role = session?.user?.role ?? "CUSTOMER";

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold text-amber-700">
            Blanche Bridal
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link
              href="/catalog"
              className="hover:text-gray-900 transition-colors"
            >
              Collection
            </Link>

            {/* Cart icon — visible to all users including guests */}
            <CartIcon />

            {/* Loading — show nothing to avoid flash */}
            {loading && <div className="w-8 h-8" />}

            {/* Logged out — show Sign in */}
            {!loading && !session && (
              <Link
                href="/login"
                className="hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Logged in — show avatar dropdown */}
            {!loading && session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-8 h-8 rounded-full bg-amber-600 text-white text-sm font-semibold
                               flex items-center justify-center hover:bg-amber-700 transition-colors
                               focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    aria-label="Account menu"
                  >
                    {initials}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {/* User info */}
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {firstName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href={getDashboardUrl(role)}
                      className="cursor-pointer"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={getProfileUrl(role)} className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>

      {/* Cart drawer rendered outside header so it overlays the full page */}
      <CartDrawer />
    </>
  );
}
