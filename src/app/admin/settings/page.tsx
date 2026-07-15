"use client";

import { useSession } from "next-auth/react";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "—";
  const email = session?.user?.email ?? "—";

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/admin/dashboard"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>

      <h1 className="font-heading mb-5 text-xl font-medium text-foreground">
        Profile settings
      </h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-[13px] text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Stub: read-only for now. No backend endpoint exists yet to update
            admin name/password -- wire this up as a real form once that's
            built (see redesign guide Phase 1 open items). */}
        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="text-[13px] text-muted-foreground">
            Editing isn&apos;t available yet — this is a read-only view for now.
          </p>
        </div>
      </div>
    </div>
  );
}