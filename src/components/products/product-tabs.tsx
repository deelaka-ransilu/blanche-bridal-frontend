"use client";

import { useState, type ReactNode } from "react";

export function ProductTabs({
  detailsContent,
  reviewsContent,
  reviewCount,
}: {
  detailsContent: ReactNode;
  reviewsContent: ReactNode;
  reviewCount: number;
}) {
  const [tab, setTab] = useState<"details" | "reviews">("details");

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-6 flex gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            tab === "details" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Product Details
          {tab === "details" && (
            <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            tab === "reviews" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews {reviewCount > 0 && `(${reviewCount})`}
          {tab === "reviews" && (
            <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {tab === "details" ? detailsContent : reviewsContent}
    </div>
  );
}