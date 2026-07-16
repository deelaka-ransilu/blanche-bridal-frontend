"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function DistrictCombobox({
  districts,
  value,
  onChange,
  placeholder = "Type to search district…",
}: {
  districts: readonly string[];
  value: string;
  onChange: (district: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the visible text in sync if `value` changes from outside
  // (e.g. parent resets the form).
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered =
    query.trim().length === 0
      ? districts
      : districts.filter((d) => d.toLowerCase().includes(query.trim().toLowerCase()));

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectDistrict(district: string) {
    onChange(district);
    setQuery(district);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) selectDistrict(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
            // Clear the committed value while the user is actively typing
            // something that no longer matches exactly — forces them
            // to pick a real option again rather than submitting free text.
            if (e.target.value !== value) {
              onChange("");
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-9 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none"
        />
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((district, i) => (
            <li key={district}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep input focus, avoid blur-before-click
                onClick={() => selectDistrict(district)}
                className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${
                  i === highlighted
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {district}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-lg">
          No matching district
        </div>
      )}
    </div>
  );
}