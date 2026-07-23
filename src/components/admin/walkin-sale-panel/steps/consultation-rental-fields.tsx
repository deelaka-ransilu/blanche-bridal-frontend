"use client";

import { Search, Loader2 } from "lucide-react";
import type { RentableProduct } from "@/types/rental";

interface ConsultationRentalFieldsProps {
  todayStr: string;
  selectedGown: RentableProduct | null;
  setSelectedGown: (p: RentableProduct | null) => void;
  gownSearch: string;
  setGownSearch: (v: string) => void;
  filteredGowns: RentableProduct[];
  rentableLoading: boolean;
  rentableError: string | null;
  rentalStart: string;
  setRentalStart: (v: string) => void;
  rentalEnd: string;
  isRentalStartInPast: boolean;
  rentalPaymentMethod: string;
  setRentalPaymentMethod: (v: string) => void;
  rentalNotes: string;
  setRentalNotes: (v: string) => void;
  rentalDays: number;
  rentalFee: number;
  rentalError: string | null;
}

export function ConsultationRentalFields({
  todayStr,
  selectedGown,
  setSelectedGown,
  gownSearch,
  setGownSearch,
  filteredGowns,
  rentableLoading,
  rentableError,
  rentalStart,
  setRentalStart,
  rentalEnd,
  isRentalStartInPast,
  rentalPaymentMethod,
  setRentalPaymentMethod,
  rentalNotes,
  setRentalNotes,
  rentalDays,
  rentalFee,
  rentalError,
}: ConsultationRentalFieldsProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-5">
      <p className="text-xs font-medium text-foreground">Gown &amp; rental dates</p>

      {selectedGown ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary bg-primary/5 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{selectedGown.name}</p>
            {selectedGown.categoryName && (
              <p className="text-xs text-muted-foreground">{selectedGown.categoryName}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedGown.rentalPricePerDay != null
                ? `Rs ${selectedGown.rentalPricePerDay.toLocaleString("en-LK")}/day`
                : `Rs ${(selectedGown.rentalPrice ?? 0).toLocaleString("en-LK")} flat`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedGown(null)}
            className="shrink-0 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={gownSearch}
              onChange={(e) => setGownSearch(e.target.value)}
              placeholder="Search rentable gowns..."
              className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {rentableLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading rentable gowns...
            </div>
          )}
          {!rentableLoading && rentableError && (
            <p className="py-2 text-center text-xs text-destructive">{rentableError}</p>
          )}

          {!rentableLoading && !rentableError && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
              {filteredGowns.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedGown(p)}
                  className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left last:border-b-0 transition-colors hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    {p.categoryName && (
                      <p className="truncate text-xs text-muted-foreground">{p.categoryName}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {p.rentalPricePerDay != null
                      ? `Rs ${p.rentalPricePerDay.toLocaleString("en-LK")}/day`
                      : `Rs ${(p.rentalPrice ?? 0).toLocaleString("en-LK")}`}
                  </p>
                </button>
              ))}
              {filteredGowns.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No rentable gowns available right now.
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Rental date</label>
        <input
          type="date"
          min={todayStr}
          value={rentalStart}
          onChange={(e) => setRentalStart(e.target.value)}
          className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        {rentalStart && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pickup {rentalStart}, return {rentalEnd}
          </p>
        )}
      </div>
      {isRentalStartInPast && (
        <p className="text-xs text-destructive">Rental start date can&apos;t be in the past.</p>
      )}

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Payment method</label>
        <select
          value={rentalPaymentMethod}
          onChange={(e) => setRentalPaymentMethod(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="CASH" className="bg-background text-foreground">Cash</option>
          <option value="PAYHERE" className="bg-background text-foreground">PayHere</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">Booking notes</label>
        <textarea
          value={rentalNotes}
          onChange={(e) => setRentalNotes(e.target.value)}
          rows={3}
          placeholder="Special requests for this booking — e.g. reason for the date range, delivery preference..."
          className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {selectedGown && rentalDays > 0 && (
        <div className="rounded-lg border border-dashed border-border p-3 font-mono text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{rentalDays} day{rentalDays === 1 ? "" : "s"}</span>
            <span className="text-foreground">Rs {rentalFee.toLocaleString("en-LK")}</span>
          </div>
        </div>
      )}

      {rentalError && <p className="text-xs text-destructive">{rentalError}</p>}
    </div>
  );
}
