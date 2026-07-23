"use client";

import { Loader2 } from "lucide-react";
import type { OccasionType } from "@/types/appointment";

interface ConsultationCustomFieldsProps {
  todayStr: string;
  occasionType: OccasionType | "";
  setOccasionType: (v: OccasionType) => void;
  occasionDate: string;
  setOccasionDate: (v: string) => void;
  consultationDate: string;
  setConsultationDate: (v: string) => void;
  availableSlots: string[];
  slotsLoading: boolean;
  selectedSlot: string;
  setSelectedSlot: (v: string) => void;
  customDesignError: string | null;
}

export function ConsultationCustomFields({
  todayStr,
  occasionType,
  setOccasionType,
  occasionDate,
  setOccasionDate,
  consultationDate,
  setConsultationDate,
  availableSlots,
  slotsLoading,
  selectedSlot,
  setSelectedSlot,
  customDesignError,
}: ConsultationCustomFieldsProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-border pt-5">
      <p className="text-xs font-medium text-foreground">Occasion &amp; consultation slot</p>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="mb-1 block text-[11px] text-muted-foreground">Occasion</label>
          <select
            value={occasionType}
            onChange={(e) => setOccasionType(e.target.value as OccasionType)}
            style={{ colorScheme: "dark" }}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="" className="bg-background text-foreground">Select...</option>
            <option value="WEDDING" className="bg-background text-foreground">Wedding</option>
            <option value="ENGAGEMENT" className="bg-background text-foreground">Engagement</option>
            <option value="OTHER" className="bg-background text-foreground">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-muted-foreground">Occasion date</label>
          <input
            type="date"
            min={todayStr}
            value={occasionDate}
            onChange={(e) => setOccasionDate(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Consultation date (today)</label>
        <input
          type="date"
          min={todayStr}
          value={consultationDate}
          onChange={(e) => setConsultationDate(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {consultationDate && (
        <div>
          <label className="mb-1 block text-[11px] text-muted-foreground">Time slot</label>
          {slotsLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading slots...
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No open slots on this date.</p>
          )}
        </div>
      )}

      {customDesignError && <p className="text-xs text-destructive">{customDesignError}</p>}
    </div>
  );
}
