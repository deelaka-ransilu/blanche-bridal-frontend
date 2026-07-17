"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

// Wrap any interactive element (status button, etc.) inside a ClickableUserRow
// with this so clicking it doesn't also trigger the row's navigation.
export function StopRowClick({ children }: { children: ReactNode }) {
  return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
}

export function ClickableUserRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
    >
      {children}
    </div>
  );
}