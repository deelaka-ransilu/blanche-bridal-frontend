"use client";

import { Home, CheckCircle2, Calendar, Menu } from "lucide-react";

export function BottomNav({ onMore }: { onMore?: () => void }) {
  const handleMore = onMore ?? (() => {});

  return (
    <nav className="fixed bottom-4 left-4 right-4 mx-auto flex max-w-[358px] items-center justify-between rounded-full border border-white/10 bg-neutral-900/55 p-1.5 backdrop-blur-lg">
      <button className="flex flex-1 flex-col items-center gap-0.5 rounded-full bg-white/15 py-2.5" aria-label="Dashboard">
        <Home className="h-5 w-5 text-white" />
      </button>
      <button className="flex flex-1 flex-col items-center gap-0.5 py-2.5" aria-label="Orders">
        <CheckCircle2 className="h-5 w-5 text-white/65" />
      </button>
      <button className="flex flex-1 flex-col items-center gap-0.5 py-2.5" aria-label="Appointments">
        <Calendar className="h-5 w-5 text-white/65" />
      </button>
      <button
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
        aria-label="More"
        onClick={handleMore}
      >
        <Menu className="h-5 w-5 text-white/65" />
      </button>
    </nav>
  );
}