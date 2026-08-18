"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuoteAction, type CreateQuoteState } from "@/lib/actions/custom-quotes";
import type { SplitType } from "@/lib/api/custom-quotes";

const initialState: CreateQuoteState = null;

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

const LINE_ITEMS = [
  { name: "fabricAmount", label: "Fabric & materials" },
  { name: "laborAmount", label: "Stitching / tailoring labor" },
  { name: "embellishmentAmount", label: "Embellishments / detailing" },
  { name: "alterationsAmount", label: "Alterations & fitting" },
] as const;

export type QuoteDefaultValues = {
  fabricAmount: number;
  laborAmount: number;
  embellishmentAmount: number;
  alterationsAmount: number;
  otherAmount: number;
  otherNote: string | null;
  splitType: SplitType;
};

type Props = {
  customDesignRequestId: string;
  defaultValues?: QuoteDefaultValues;
};

export function QuoteForm({ customDesignRequestId, defaultValues }: Props) {
  const actionWithId = createQuoteAction.bind(null, customDesignRequestId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  const [amounts, setAmounts] = useState<Record<string, string>>({
    fabricAmount: defaultValues ? String(defaultValues.fabricAmount) : "",
    laborAmount: defaultValues ? String(defaultValues.laborAmount) : "",
    embellishmentAmount: defaultValues ? String(defaultValues.embellishmentAmount) : "",
    alterationsAmount: defaultValues ? String(defaultValues.alterationsAmount) : "",
    otherAmount: defaultValues ? String(defaultValues.otherAmount) : "",
  });
  const [otherNote, setOtherNote] = useState(defaultValues?.otherNote ?? "");
  const [splitType, setSplitType] = useState<SplitType>(defaultValues?.splitType ?? "FIFTY_FIFTY");
  const [clientError, setClientError] = useState<string | null>(null);

  const total = useMemo(() => {
    return Object.values(amounts).reduce((sum, v) => {
      const n = Number(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [amounts]);

  const otherAmountNum = Number(amounts.otherAmount) || 0;
  const otherNoteRequired = otherAmountNum > 0;

  function setAmount(name: string, value: string) {
    setAmounts((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(formData: FormData) {
    setClientError(null);

    for (const { name, label } of [...LINE_ITEMS, { name: "otherAmount", label: "Other / miscellaneous" } as const]) {
      const value = Number(formData.get(name));
      if (Number.isNaN(value) || value < 0) {
        setClientError(`${label} must be a valid, non-negative amount.`);
        return;
      }
    }
    if (otherNoteRequired && otherNote.trim().length === 0) {
      setClientError("A note is required when there's an 'other' amount.");
      return;
    }

    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {LINE_ITEMS.map(({ name, label }) => (
        <div key={name} className="flex items-center justify-between gap-3">
          <label htmlFor={name} className="text-[13px] text-muted-foreground">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type="number"
            min={0}
            step="0.01"
            value={amounts[name]}
            onChange={(e) => setAmount(name, e.target.value)}
            placeholder="0.00"
            className="w-32 rounded-lg border border-border bg-background px-2.5 py-1.5 text-right text-[13px]"
          />
        </div>
      ))}

      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="otherAmount" className="text-[13px] text-muted-foreground">
            Other / miscellaneous
          </label>
          <input
            id="otherAmount"
            name="otherAmount"
            type="number"
            min={0}
            step="0.01"
            value={amounts.otherAmount}
            onChange={(e) => setAmount("otherAmount", e.target.value)}
            placeholder="0.00"
            className="w-32 rounded-lg border border-border bg-background px-2.5 py-1.5 text-right text-[13px]"
          />
        </div>

        {otherNoteRequired && (
          <input
            name="otherNote"
            type="text"
            value={otherNote}
            onChange={(e) => setOtherNote(e.target.value)}
            placeholder="Explain the 'other' amount (required)"
            className="mt-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px]"
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-[13px] font-medium text-foreground">Total</span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(total)}</span>
      </div>

      <div className="border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Payment split
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSplitType("FIFTY_FIFTY")}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              splitType === "FIFTY_FIFTY"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground"
            }`}
          >
            50/50 split
          </button>
          <button
            type="button"
            onClick={() => setSplitType("FULL_UPFRONT")}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              splitType === "FULL_UPFRONT"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground"
            }`}
          >
            Full upfront
          </button>
        </div>
        <input type="hidden" name="splitType" value={splitType} />
      </div>

      {(clientError || (state && !state.success)) && (
        <p className="text-xs text-status-cancelled">{clientError ?? (state as { message: string }).message}</p>
      )}

      <button
        type="submit"
        disabled={isPending || total <= 0}
        className="w-full rounded-lg bg-foreground py-2 text-xs font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Sending quote…" : "Send quote"}
      </button>
    </form>
  );
}