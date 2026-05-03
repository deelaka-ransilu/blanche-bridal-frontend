"use client";

import { useEffect, useRef, useState } from "react";
import { Category, ProductFilters, ProductMode, ProductType } from "@/types";
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

// Pills used for Type and Mode rows
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium border transition-colors rounded-full ${
        active
          ? "bg-bridal-gold text-white border-bridal-gold"
          : "bg-white text-bridal-text/70 border-bridal-gold/25 hover:border-bridal-gold/60 hover:text-bridal-text"
      }`}
    >
      {children}
    </button>
  );
}

export function CatalogFilters({
  categories,
  filters,
  onChange,
}: CatalogFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  // Keep ref to latest filters so debounce closure stays fresh
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Skip debounce on first render
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
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  function setType(type: ProductType | undefined) {
    // Clear mode when switching away from DRESS
    onChange({ ...filters, type, mode: undefined, page: 0 });
  }

  function setMode(mode: ProductMode | undefined) {
    onChange({ ...filters, mode, page: 0 });
  }

  function setCategory(categoryId: string | undefined) {
    onChange({ ...filters, categoryId, page: 0 });
  }

  function setMinPrice(value: string) {
    onChange({ ...filters, minPrice: value ? Number(value) : undefined, page: 0 });
  }

  function setMaxPrice(value: string) {
    onChange({ ...filters, maxPrice: value ? Number(value) : undefined, page: 0 });
  }

  function setAvailable(checked: boolean) {
    onChange({ ...filters, available: checked ? true : undefined, page: 0 });
  }

  function clearAll() {
    setSearchInput("");
    // Preserve collection param if it came from a landing page link
    onChange({ collection: filters.collection });
  }

  const hasActiveFilters =
    filters.type ||
    filters.mode ||
    filters.categoryId ||
    filters.search ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.available;

  const showModeFilter = !filters.type || filters.type === "DRESS";

  return (
    <div className="space-y-5">

      {/* Active collection badge — read-only, shown when arriving from landing */}
      {filters.collection && (
        <div className="flex items-center justify-between rounded-lg border border-bridal-gold/30 bg-bridal-gold/8 px-3 py-2">
          <div>
            <p className="font-jost text-[0.55rem] font-bold uppercase tracking-[0.18em] text-bridal-gold">
              Collection
            </p>
            <p className="font-jost text-xs font-medium text-bridal-text capitalize">
              {filters.collection.toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...filters, collection: undefined, page: 0 })}
            className="font-jost text-[0.6rem] text-bridal-muted transition-colors hover:text-bridal-text"
            aria-label="Clear collection filter"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <p className="mb-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-muted">
          Search
        </p>
        <Input
          placeholder="Search dresses, accessories..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border-bridal-gold/25 bg-white font-jost text-xs text-bridal-text placeholder:text-bridal-muted/60 focus:border-bridal-gold/60"
        />
      </div>

      {/* Type */}
      <div>
        <p className="mb-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-muted">
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!filters.type} onClick={() => setType(undefined)}>
            All
          </FilterPill>
          <FilterPill active={filters.type === "DRESS"} onClick={() => setType("DRESS")}>
            Dresses
          </FilterPill>
          <FilterPill active={filters.type === "ACCESSORY"} onClick={() => setType("ACCESSORY")}>
            Accessories
          </FilterPill>
        </div>
      </div>

      {/* Mode — only shown for dresses */}
      {showModeFilter && (
        <div>
          <p className="mb-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-muted">
            Availability
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={!filters.mode} onClick={() => setMode(undefined)}>
              All
            </FilterPill>
            <FilterPill active={filters.mode === "rental"} onClick={() => setMode("rental")}>
              Rent
            </FilterPill>
            <FilterPill active={filters.mode === "purchase"} onClick={() => setMode("purchase")}>
              Purchase
            </FilterPill>
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <p className="mb-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-muted">
          Category
        </p>
        <div className="catalog-select">
          <Select
            value={filters.categoryId ?? "all"}
            onValueChange={(v) => setCategory(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="border-bridal-gold/25 bg-white font-jost text-xs text-bridal-text">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="z-[200] bg-white">
              <SelectItem value="all" className="cursor-pointer font-jost text-xs">
                All categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="cursor-pointer font-jost text-xs"
                >
                  {cat.parentName ? `${cat.parentName} → ${cat.name}` : cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 font-jost text-[0.58rem] font-bold uppercase tracking-[0.18em] text-bridal-muted">
          Price (LKR)
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border-bridal-gold/25 bg-white font-jost text-xs"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border-bridal-gold/25 bg-white font-jost text-xs"
          />
        </div>
      </div>

      {/* Available only */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={filters.available === true}
          onChange={(e) => setAvailable(e.target.checked)}
          className="rounded border-bridal-gold/40 text-bridal-gold focus:ring-bridal-gold/40"
        />
        <span className="font-jost text-xs text-bridal-text/75">Available only</span>
      </label>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="w-full font-jost text-[0.6rem] uppercase tracking-[0.12em] text-bridal-muted hover:text-bridal-text"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}