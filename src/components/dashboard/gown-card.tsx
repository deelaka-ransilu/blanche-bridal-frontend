// components/dashboard/gown-card.tsx
import Image from "next/image";
import Link from "next/link";
import { Gem } from "lucide-react";
import { StatusBadge, type Status } from "./status-badge";

export function GownCard({
  href,
  title,
  subtitle,
  status,
  statusLabel,
  imageUrl,
}: {
  href: string;
  title: string;
  subtitle: string;
  status: Status;
  statusLabel: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10">
            <Gem className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        <div className="mt-1.5">
          <StatusBadge status={status}>{statusLabel}</StatusBadge>
        </div>
      </div>
    </Link>
  );
}