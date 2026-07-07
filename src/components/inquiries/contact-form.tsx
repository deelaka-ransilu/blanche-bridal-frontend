"use client";

import { useActionState } from "react";
import { submitInquiryAction } from "@/lib/actions/inquiries";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitInquiryAction, null);

  if (state?.success) {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name *</label>
        <input name="name" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Email *</label>
        <input type="email" name="email" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input name="phone" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Subject</label>
        <input name="subject" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Message *</label>
        <textarea name="message" required rows={5} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Inquiry"}
      </button>
      {state && !state.success && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}