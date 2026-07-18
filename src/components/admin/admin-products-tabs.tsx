"use client";

import { useState, type ReactNode } from "react";
import { RentalsPanel } from "@/components/admin/products/rentals-panel";
import { GalleryPanel } from "@/components/admin/products/gallery-panel";

type TopTab = "catalog" | "rentals" | "gallery";
type CatalogSubTab = "products" | "categories";

export function AdminProductsTabs({
  productsCount,
  categoriesCount,
  productTrigger,
  categoryTrigger,
  productsContent,
  categoriesContent,
}: {
  productsCount: number;
  categoriesCount: number;
  productTrigger: ReactNode;
  categoryTrigger: ReactNode;
  productsContent: ReactNode;
  categoriesContent: ReactNode;
}) {
  const [topTab, setTopTab] = useState<TopTab>("catalog");
  const [catalogSubTab, setCatalogSubTab] = useState<CatalogSubTab>("products");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: "catalog", label: "Catalog" },
            { key: "rentals", label: "Rentals" },
            { key: "gallery", label: "Gallery" },
          ] as const
        ).map((tab) => {
          const isActive = tab.key === topTab;
          return (
            <button
              key={tab.key}
              onClick={() => setTopTab(tab.key)}
              className={[
                "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {topTab === "catalog" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                onClick={() => setCatalogSubTab("products")}
                className={[
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  catalogSubTab === "products"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Products · {productsCount}
              </button>
              <button
                onClick={() => setCatalogSubTab("categories")}
                className={[
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  catalogSubTab === "categories"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                Categories · {categoriesCount}
              </button>
            </div>

            {catalogSubTab === "products" ? productTrigger : categoryTrigger}
          </div>

          {catalogSubTab === "products" ? productsContent : categoriesContent}
        </div>
      )}

      {topTab === "rentals" && <RentalsPanel />}
      {topTab === "gallery" && <GalleryPanel />}
    </div>
  );
}