"use client";

import { useActionState } from "react";
import { submitInquiryAction } from "@/lib/actions/inquiries";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiryAction, null);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-status-completed/30 bg-status-completed/10 p-6 text-center">
        <p className="text-sm font-medium text-status-completed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground">Name *</label>
        <input name="name" required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Email *</label>
        <input type="email" name="email" required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Message *</label>
        <textarea name="message" required rows={5} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Inquiry"}
      </button>
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}