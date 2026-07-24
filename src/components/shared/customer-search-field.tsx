// src/components/shared/customer-search-field.tsx
"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { AdminUser } from "@/types/user";

export function CustomerSearchField({
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  error,
}: {
  customers: AdminUser[];
  selectedCustomer: AdminUser | null;
  onSelect: (customer: AdminUser) => void;
  onClear: () => void;
  error?: string;
}) {
  const [search, setSearch] = useState(
    selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "",
  );
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, search]);

  function handleSelect(customer: AdminUser) {
    setSearch(`${customer.firstName} ${customer.lastName}`);
    setOpen(false);
    onSelect(customer);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onClear();
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search by name or email…"
        className="pl-8"
      />
      {open && filtered.length > 0 && !selectedCustomer && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover p-1 shadow-md">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className="flex w-full flex-col items-start rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="text-foreground">
                {c.firstName} {c.lastName}
              </span>
              <span className="text-xs text-muted-foreground">{c.email}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}