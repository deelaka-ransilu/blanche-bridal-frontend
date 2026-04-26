"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FloatingNav } from "@/components/ui/floating-navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "About", link: "#about" },
  { name: "Services", link: "#services" },
  { name: "Gallery", link: "#gallery" },
  { name: "Our story", link: "#story" },
  { name: "Contact", link: "#contact" },
];

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "/superadmin/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "EMPLOYEE":
      return "/employee/dashboard";
    default:
      return "/my/profile";
  }
}

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

export default function LandingNav() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const role = session?.user?.role ?? "CUSTOMER";
  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "";
  const initials = firstName.charAt(0).toUpperCase();

  const rightSlot = loading ? (
    // Empty placeholder — prevents layout shift while session loads
    <div className="w-8 h-8" />
  ) : session ? (
    // Logged in — amber avatar with dropdown
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-8 h-8 rounded-full bg-[#A86A4B] text-white text-sm font-semibold
                     flex items-center justify-center hover:bg-[#8f5a3c] transition-colors
                     focus:outline-none focus:ring-2 focus:ring-[#A86A4B] focus:ring-offset-2"
          aria-label="Account menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white border border-gray-200 shadow-lg"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {firstName}
          </p>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem asChild>
          <Link
            href={getDashboardUrl(role)}
            className="cursor-pointer text-gray-700 focus:text-gray-900 focus:bg-gray-50"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={getProfileUrl(role)}
            className="cursor-pointer text-gray-700 focus:text-gray-900 focus:bg-gray-50"
          >
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    // Logged out — Sign in link matching original style
    <Link
      href="/login"
      className="text-xs px-3 py-1.5 rounded-full border border-[#A86A4B] text-[#A86A4B]
                 hover:bg-[#A86A4B] hover:text-white transition-all duration-200"
    >
      Sign in
    </Link>
  );

  return (
    <FloatingNav
      navItems={navItems}
      className="border border-[#e8d8cc] bg-[#fffaf7]/90 backdrop-blur-md"
      rightSlot={rightSlot}
    />
  );
}
