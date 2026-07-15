"use client";

import { useState, type ReactNode } from "react";

export function AdminProductsTabs({
  productsCount,
  categoriesCount,
  productsContent,
  categoriesContent,
}: {
  productsCount: number;
  categoriesCount: number;
  productsContent: ReactNode;
  categoriesContent: ReactNode;
}) {
  const [tab, setTab] = useState<"products" | "categories">("products");

  return (
    <div>
      <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("products")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "products"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Products <span className="opacity-70">· {productsCount}</span>
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "categories"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Categories <span className="opacity-70">· {categoriesCount}</span>
        </button>
      </div>

      {tab === "products" ? productsContent : categoriesContent}
    </div>
  );
}