"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard — coming soon</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Full dashboard metrics (appointments, orders, rentals, inquiries, reviews)
        depend on Steps 2–8, which haven&apos;t been built yet on this branch.
        This page will be restored once those are in place.
      </p>
    </div>
  );
}