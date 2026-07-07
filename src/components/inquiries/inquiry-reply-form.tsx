"use client";

import { useActionState } from "react";
import { sendInquiryReplyAction } from "@/lib/actions/inquiries";

export function InquiryReplyForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    sendInquiryReplyAction.bind(null, id),
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Write your reply..."
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Reply"}
      </button>
      {state && (
        <p className={state.success ? "text-sm text-green-600" : "text-sm text-red-600"}>
          {state.message}
        </p>
      )}
    </form>
  );
}