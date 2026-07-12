"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How far in advance should I book a fitting?",
    a: "We recommend booking your first fitting at least 3 months before your wedding date to allow time for alterations, especially for custom orders.",
  },
  {
    q: "Can I rent a gown instead of buying?",
    a: "Yes — most of our collection is available to rent or purchase. Rental bookings include a fitting appointment and a pickup/return window.",
  },
  {
    q: "Do you offer custom or made-to-measure gowns?",
    a: "We do. Custom orders start with a design consultation, followed by measurement fittings and production stage updates you can track from your dashboard.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Orders and appointments can be cancelled from your dashboard. Refund eligibility depends on how far along production or the rental period is — reach out via the form below for specifics.",
  },
  {
    q: "How do I check the status of my order?",
    a: "Sign in and visit your dashboard — you'll see live status for orders, upcoming appointments, and any balance due.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2.5">
      {FAQS.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div
            key={faq.q}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-foreground">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}