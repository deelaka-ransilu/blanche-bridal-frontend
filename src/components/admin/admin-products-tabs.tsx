"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function AdminProductsTabs({
  productsCount,
  categoriesCount,
  productsContent,
  categoriesContent,
  productTrigger,
  categoryTrigger,
}: {
  productsCount: number;
  categoriesCount: number;
  productsContent: ReactNode;
  categoriesContent: ReactNode;
  /** Rendered in the header next to the title, but only while the Products tab is active. */
  productTrigger: ReactNode;
  /** Rendered in the header next to the title, but only while the Categories tab is active. */
  categoryTrigger: ReactNode;
}) {
  const noCategories = categoriesCount === 0;
  const [tab, setTab] = useState<"products" | "categories">(
    noCategories ? "categories" : "products",
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-medium text-foreground">Products</h1>
          <p className="text-[13px] text-muted-foreground">
            {productsCount} products · {categoriesCount} categories
          </p>
        </div>
        {tab === "products" && !noCategories ? productTrigger : null}
        {tab === "categories" ? categoryTrigger : null}
      </div>

      {noCategories && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Create a category first</p>
            <p className="text-xs text-muted-foreground">
              Products need a category to belong to. Add one below to get started.
            </p>
          </div>
        </div>
      )}

      <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("products")}
          disabled={noCategories}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "products"
              ? "bg-primary text-primary-foreground"
              : noCategories
                ? "cursor-not-allowed text-muted-foreground/40"
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