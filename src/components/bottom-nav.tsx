"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckCircle2, Calendar, RefreshCw } from "lucide-react";

const navItems = [
  { href: "/my/dashboard", label: "Home", icon: Home },
  { href: "/my/orders", label: "Orders", icon: CheckCircle2 },
  { href: "/my/appointments", label: "Visits", icon: Calendar },
  { href: "/my/rentals", label: "Rentals", icon: RefreshCw },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 mx-auto flex max-w-[400px] items-center justify-between rounded-full border border-border bg-card/80 p-1.5 shadow-lg backdrop-blur-lg">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 ${
              active ? "bg-primary/15" : ""
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}