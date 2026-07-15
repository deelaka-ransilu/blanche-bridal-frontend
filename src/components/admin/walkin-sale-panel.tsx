"use client";

import { useState } from "react";
import { X, Search, UserPlus, Sparkles, Shirt, ShoppingBag, ChevronLeft } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// DUMMY DATA — replace with real API calls once the flow is confirmed.
// Shapes deliberately mirror the real backend DTOs so swapping later is a
// find-and-replace of the data source, not a rewrite of the component.
// ─────────────────────────────────────────────────────────────────────────

type VisitType = "CUSTOM" | "RENTAL" | "PURCHASE";

type DummyCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
};

const DUMMY_CUSTOMERS: DummyCustomer[] = [
  { id: "c1", firstName: "Amaya", lastName: "Perera", phone: "077 123 4567", email: "amaya@email.com" },
  { id: "c2", firstName: "Nethmi", lastName: "Silva", phone: "071 987 6543", email: null },
  { id: "c3", firstName: "Dilki", lastName: "Fernando", phone: "076 555 2211", email: "dilki@email.com" },
];

const DUMMY_PORTFOLIO = [
  { id: "p1", label: "Ivory lace A-line, Aug 2025" },
  { id: "p2", label: "Mermaid silhouette, beaded bodice" },
  { id: "p3", label: "Off-shoulder ballgown" },
  { id: "p4", label: "Minimalist crepe, low back" },
  { id: "p5", label: "Cathedral train, floral appliqué" },
  { id: "p6", label: "Boho chiffon, open sleeves" },
];

// ─────────────────────────────────────────────────────────────────────────

const VISIT_TYPES: { type: VisitType; label: string; description: string; icon: typeof Sparkles }[] = [
  {
    type: "CUSTOM",
    label: "Custom design",
    description: "Made-to-order — consultation, measurements, production",
    icon: Sparkles,
  },
  {
    type: "RENTAL",
    label: "Rental",
    description: "Existing gown — fitting, adjustments, measurements",
    icon: Shirt,
  },
  {
    type: "PURCHASE",
    label: "Straight purchase",
    description: "Ready-made, off the rack — no fitting needed",
    icon: ShoppingBag,
  },
];

// Step sequence per visit type. "Order" and "Payment" are shared endpoints
// every path converges on — only what happens before them differs.
const STEP_SEQUENCE: Record<VisitType, string[]> = {
  CUSTOM: ["customer", "consultation", "measurements", "order", "payment"],
  RENTAL: ["customer", "consultation", "select-gown", "measurements", "order", "payment"],
  PURCHASE: ["customer", "order", "payment"],
};

const STEP_LABEL: Record<string, string> = {
  customer: "Customer",
  consultation: "Consultation",
  "select-gown": "Select gown",
  measurements: "Measurements",
  order: "Order",
  payment: "Payment",
};

export function WalkInSalePanel({ onClose }: { onClose: () => void }) {
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<DummyCustomer | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  const [adminNotes, setAdminNotes] = useState("");
  const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);

  const steps = visitType ? STEP_SEQUENCE[visitType] : [];
  const currentStep = steps[stepIndex];

  const filteredCustomers = DUMMY_CUSTOMERS.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  function goNext() {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
  }
  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else setVisitType(null); // back out of the whole flow to the entry screen
  }

  function toggleInspiration(id: string) {
    setSelectedInspiration((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const canContinueCustomer = selectedCustomer !== null || (showNewCustomerForm && newCustomer.firstName && newCustomer.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-heading text-base font-medium text-foreground">New walk-in sale</p>
            {visitType && (
              <p className="text-xs text-muted-foreground">
                {VISIT_TYPES.find((v) => v.type === visitType)?.label}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator: dot-and-line, only current + next carry a label */}
        {visitType && (
          <div className="flex items-center border-b border-border px-5 py-4">
            {steps.map((step, i) => {
              const isCurrent = i === stepIndex;
              const isNext = i === stepIndex + 1;
              const isDone = i < stepIndex;
              const showLabel = isCurrent || isNext;

              return (
                <div key={step} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
                  <button
                    onClick={() => i <= stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex items-center justify-center rounded-full transition-all ${
                        isCurrent
                          ? "h-3 w-3 bg-primary ring-4 ring-primary/15"
                          : isDone
                            ? "h-2 w-2 bg-primary"
                            : "h-2 w-2 border border-muted-foreground/40 bg-transparent"
                      }`}
                    />
                    {showLabel && (
                      <span
                        className={`whitespace-nowrap text-[10px] font-medium ${
                          isCurrent ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {STEP_LABEL[step]}
                      </span>
                    )}
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-1 h-px flex-1 transition-colors ${
                        i < stepIndex ? "bg-primary/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Entry screen */}
          {!visitType && (
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 text-xs text-muted-foreground">What&apos;s this visit for?</p>
              {VISIT_TYPES.map(({ type, label, description, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    setVisitType(type);
                    setStepIndex(0);
                  }}
                  className="flex items-start gap-3 rounded-xl border border-border p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Customer step */}
          {currentStep === "customer" && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {!showNewCustomerForm && (
                <div className="flex flex-col gap-1.5">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        selectedCustomer?.id === c.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                      {selectedCustomer?.id === c.id && (
                        <span className="text-[11px] font-medium text-primary">Selected</span>
                      )}
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && customerSearch && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No matches for &quot;{customerSearch}&quot;
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setShowNewCustomerForm(true);
                      setSelectedCustomer(null);
                    }}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New customer
                  </button>
                </div>
              )}

              {showNewCustomerForm && (
                <div className="flex flex-col gap-3 rounded-lg border border-border p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">New customer</p>
                    <button
                      onClick={() => setShowNewCustomerForm(false)}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Search instead
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                      placeholder="First name"
                      className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                      placeholder="Last name"
                      className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="Phone"
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="Email (optional)"
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Consultation step */}
          {currentStep === "consultation" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground">Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="What did she describe wanting? Any details worth remembering for this order..."
                  className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Saved to {selectedCustomer?.firstName ?? (newCustomer.firstName || "this customer")}&apos;s profile permanently.
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground">
                  Inspiration from past work
                  {selectedInspiration.length > 0 && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · {selectedInspiration.length} selected
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DUMMY_PORTFOLIO.map((item) => {
                    const selected = selectedInspiration.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleInspiration(item.id)}
                        className={`overflow-hidden rounded-lg border text-left transition-colors ${
                          selected ? "border-primary" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`flex h-20 items-center justify-center ${
                            selected ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Shirt
                            className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground/50"}`}
                          />
                        </div>
                        <p className="px-2 py-1.5 text-[11px] text-foreground">{item.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for not-yet-built steps */}
          {currentStep && !["customer", "consultation"].includes(currentStep) && (
            <div className="flex h-full items-center justify-center py-16">
              <p className="text-xs text-muted-foreground">
                &quot;{STEP_LABEL[currentStep]}&quot; step — coming next.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {visitType && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              onClick={goNext}
              disabled={currentStep === "customer" && !canContinueCustomer}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}