"use client";

import { useEffect, useRef, useState } from "react";
import { Category, ProductFilters, ProductType } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CatalogFiltersProps {
  categories: Category[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function CatalogFilters({
  categories,
  filters,
  onChange,
}: CatalogFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Keep a ref to latest filters so the debounce closure never goes stale
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Skip debounce on first render so mobile drawer doesn't close immediately
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      onChange({
        ...filtersRef.current,
        search: searchInput || undefined,
        page: 0,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function setType(type: ProductType | undefined) {
    onChange({ ...filters, type, page: 0 });
  }

  function setCategory(categoryId: string | undefined) {
    onChange({ ...filters, categoryId, page: 0 });
  }

  function setMinPrice(value: string) {
    onChange({
      ...filters,
      minPrice: value ? Number(value) : undefined,
      page: 0,
    });
  }

  function setMaxPrice(value: string) {
    onChange({
      ...filters,
      maxPrice: value ? Number(value) : undefined,
      page: 0,
    });
  }

  function setAvailable(checked: boolean) {
    onChange({ ...filters, available: checked ? true : undefined, page: 0 });
  }

  function clearAll() {
    setSearchInput("");
    onChange({});
  }

  const hasActiveFilters =
    filters.type ||
    filters.categoryId ||
    filters.search ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.available;

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search dresses, accessories..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="bg-white"
      />

      {/* Type toggle */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Type
        </p>
        <div className="flex gap-2 flex-wrap">
          {(["All", "DRESS", "ACCESSORY"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t === "All" ? undefined : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                (t === "All" && !filters.type) || filters.type === t
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
              }`}
            >
              {t === "DRESS"
                ? "Dresses"
                : t === "ACCESSORY"
                  ? "Accessories"
                  : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Category
        </p>
        <div className="catalog-select">
          <Select
            value={filters.categoryId ?? "all"}
            onValueChange={(v) => setCategory(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="bg-white text-gray-900 border-gray-200">
              <SelectValue
                placeholder="All categories"
                className="text-gray-900"
              />
            </SelectTrigger>
            <SelectContent className="bg-white z-[200]">
              <SelectItem value="all" className="cursor-pointer">
                All categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="cursor-pointer"
                >
                  {cat.parentName
                    ? `${cat.parentName} → ${cat.name}`
                    : cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
          Price (LKR)
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>

      {/* Available only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.available === true}
          onChange={(e) => setAvailable(e.target.checked)}
          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm text-gray-700">Available only</span>
      </label>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={clearAll}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
