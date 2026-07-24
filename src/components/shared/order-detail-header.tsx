// src/components/shared/order-detail-header.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function OrderDetailHeader({
  backHref,
  backLabel,
  title,
  customerName,
  createdAt,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  customerName: string;
  createdAt: string | null;
}) {
  return (
    <div className="mb-5">
      <Link
        href={backHref}
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> {backLabel}
      </Link>
      <h1 className="font-heading text-xl font-medium text-foreground">{title}</h1>
      <p className="text-[13px] text-muted-foreground">
        {customerName} · placed {formatDate(createdAt)}
      </p>
    </div>
  );
}