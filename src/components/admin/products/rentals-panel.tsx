"use client";

import { useMemo, useState } from "react";
import {
  mockRentalProducts,
  mockCategories,
  type RentalStatus,
  type MockCategory,
} from "@/lib/mock/products-mock";
import { RentalProductForm } from "./rental-product-form";
import { RentalCategoryForm } from "./rental-category-form";

const STATUS_STYLES: Record<RentalStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  RENTED: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<RentalStatus, string> = {
  AVAILABLE: "Available",
  RENTED: "Currently rented",
  OVERDUE: "Overdue",
};

const STATUS_FILTERS: { key: RentalStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "AVAILABLE", label: "Available" },
  { key: "RENTED", label: "Rented" },
  { key: "OVERDUE", label: "Overdue" },
];

type RentalsSubTab = "items" | "categories";

export function RentalsPanel() {
  const [subTab, setSubTab] = useState<RentalsSubTab>("items");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RentalStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  // Frontend-first phase: dress categories live in local state so "New
  // category" here actually shows up. Once the backend `type` column on
  // categories lands, this becomes the real categories prop filtered by
  // type === "DRESS", and this local state goes away.
  const [dressCategories, setDressCategories] = useState<MockCategory[]>(
    mockCategories.filter((c) => c.type === "DRESS")
  );

  const filtered = useMemo(() => {
    return mockRentalProducts.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.rentalStatus === statusFilter;
      const matchesQuery =
        query.trim() === "" ||
        item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        item.category.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Rentals · N / Categories · N pill toggle — mirrors the Catalog tab */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-muted p-1">
          <button
            onClick={() => setSubTab("items")}
            className={[
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              subTab === "items"
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground",
            ].join(" ")}
          >
            Rentals · {mockRentalProducts.length}
          </button>
          <button
            onClick={() => setSubTab("categories")}
            className={[
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              subTab === "categories"
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground",
            ].join(" ")}
          >
            Categories · {dressCategories.length}
          </button>
        </div>

        {subTab === "items" ? (
          <button
            onClick={() => {
              setEditingId(null);
              setFormOpen(true);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            New rental item
          </button>
        ) : (
          <button
            onClick={() => setCategoryFormOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            New category
          </button>
        )}
      </div>

      {subTab === "items" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex flex-wrap gap-1 rounded-full bg-muted p-1">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={[
                    "px-3 py-1.5 text-xs rounded-full transition-colors",
                    statusFilter === filter.key
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category"
              className="w-full rounded-md border px-3 py-2 text-sm sm:w-64"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No rental items match this filter.
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category.name}
                        {item.rentalPrice != null &&
                          ` · Rs ${item.rentalPrice.toLocaleString()} flat`}
                        {item.rentalPricePerDay != null &&
                          ` · Rs ${item.rentalPricePerDay.toLocaleString()}/day`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLES[item.rentalStatus],
                      ].join(" ")}
                    >
                      {STATUS_LABEL[item.rentalStatus]}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormOpen(true);
                      }}
                      className="text-sm text-primary"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {subTab === "categories" && (
        <div className="grid gap-3">
          {dressCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">/{cat.slug}</p>
              </div>
              <button
                onClick={() =>
                  setDressCategories((prev) => prev.filter((c) => c.id !== cat.id))
                }
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Deactivate
              </button>
            </div>
          ))}
          {dressCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">No dress categories yet.</p>
          )}
        </div>
      )}

      {formOpen && (
        <RentalProductForm
          productId={editingId}
          categories={dressCategories}
          onClose={() => setFormOpen(false)}
        />
      )}

      {categoryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New category</h2>
              <button
                onClick={() => setCategoryFormOpen(false)}
                className="text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <RentalCategoryForm
              existingCategories={dressCategories}
              onCreate={(cat) => {
                setDressCategories((prev) => [...prev, cat]);
                setCategoryFormOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}