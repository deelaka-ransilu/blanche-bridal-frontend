"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, RefreshCw, Menu, X } from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/employee/dashboard", label: "Dashboard", icon: Home },
  { href: "/employee/orders", label: "Orders", icon: Package },
  { href: "/employee/rentals", label: "Rentals", icon: RefreshCw },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <p className="font-heading mb-5 px-2 text-base font-medium text-foreground">
        Blanche
      </p>

      <nav className="flex flex-1 flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] transition-colors ${
                active
                  ? "bg-primary/12 font-medium text-primary"
                  : "text-muted-foreground hover:bg-primary/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-3.5 px-1">
        <SignOutButton />
        <ThemeToggle />
      </div>
    </>
  );
}

export function EmployeeSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-svh w-64 flex-col border-r border-border bg-card p-3 lg:flex">
        <SidebarContent />
      </aside>

      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-border bg-card p-3 lg:hidden">
        <p className="font-heading text-base font-medium text-foreground">Blanche</p>
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-svh w-64 flex-col bg-card p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-heading px-2 text-base font-medium text-foreground">
                Blanche
              </p>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}