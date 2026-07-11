"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckCircle2, Calendar, Menu } from "lucide-react";
import { MoreSheet } from "@/components/my/more-sheet";

const navItems = [
  { href: "/my/dashboard", label: "Dashboard", icon: Home },
  { href: "/my/orders", label: "Orders", icon: CheckCircle2 },
  { href: "/my/appointments", label: "Appointments", icon: Calendar },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 mx-auto flex max-w-[358px] items-center justify-between rounded-full border border-border bg-card/80 p-1.5 shadow-lg backdrop-blur-lg">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2.5 ${
                active ? "bg-primary/15" : ""
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
            </Link>
          );
        })}
        <button
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
          aria-label="More"
          onClick={() => setMoreOpen(true)}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}