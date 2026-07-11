"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/my/dashboard", label: "Dashboard" },
  { href: "/my/orders", label: "Orders" },
  { href: "/my/appointments", label: "Appointments" },
];

export function MyNav({ firstName }: { firstName: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const initial = firstName ? firstName[0].toUpperCase() : "?";

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav className="flex w-full max-w-md items-center justify-between rounded-full border border-border bg-card px-3 py-2 shadow-lg sm:max-w-2xl lg:max-w-4xl">
        <Link href="/" className="flex items-center pl-1">
          <Image
            src="/logo.png"
            alt="Blanche Bridal"
            width={28}
            height={28}
            className="rounded-full"
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {initial}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </div>
  );
}