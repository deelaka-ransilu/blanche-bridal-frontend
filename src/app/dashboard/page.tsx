"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Store01Icon,
  Package01Icon,
  RulerIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

const placeholderCards = [
  {
    title: "My Appointments",
    description: "View and manage your boutique appointments.",
    icon: Calendar03Icon,
    href: "/my/appointments",
  },
  {
    title: "My Rentals",
    description: "Track your active and past dress rentals.",
    icon: Store01Icon,
    href: "/my/rentals",
  },
  {
    title: "My Orders",
    description: "View your custom dress orders and status.",
    icon: Package01Icon,
    href: "/my/orders",
  },
  {
    title: "My Measurements",
    description: "View your bridal measurements on file.",
    icon: RulerIcon,
    href: "/my/measurements",
  },
];

function WelcomePopup({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="size-5"
          />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          <p className="text-sm text-amber-600 font-medium tracking-widest uppercase">
            Welcome to
          </p>
          <h2 className="text-3xl font-semibold tracking-wide">
            Blanche Bridal
          </h2>
          <p className="text-muted-foreground text-sm">
            Hello, <span className="font-medium text-foreground">{name}</span>!
            We're glad you're here. Explore our collection or manage your
            account below.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {placeholderCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
            >
              <HugeiconsIcon
                icon={card.icon}
                strokeWidth={1.5}
                className="size-6 text-amber-600"
              />
              <span className="text-xs font-medium leading-tight">
                {card.title}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            asChild
          >
            <a href="/collection">Browse Collection</a>
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Go to my dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  const firstName =
    session?.user?.firstName ?? session?.user?.email?.split("@")[0] ?? "there";

  useEffect(() => {
    // Show welcome popup once per session (not every page refresh)
    const seen = sessionStorage.getItem("welcome_seen");
    if (!seen) {
      setShowWelcome(true);
      sessionStorage.setItem("welcome_seen", "1");
    }
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {firstName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here's a quick overview of your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {placeholderCards.map((card) => (
              <a key={card.title} href={card.href}>
                <Card className="hover:border-amber-400 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <HugeiconsIcon
                      icon={card.icon}
                      strokeWidth={1.5}
                      className="size-6 text-amber-600"
                    />
                    <CardTitle className="text-sm mt-2">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </SidebarInset>

      {showWelcome && (
        <WelcomePopup name={firstName} onClose={() => setShowWelcome(false)} />
      )}
    </SidebarProvider>
  );
}
