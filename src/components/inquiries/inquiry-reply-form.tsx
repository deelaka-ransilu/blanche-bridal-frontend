"use client";

import { useActionState } from "react";
import { sendInquiryReplyAction } from "@/lib/actions/inquiries";
import { Button } from "@/components/ui/button";

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
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Sending…" : "Send Reply"}
      </Button>
      {state && (
        <p className={`text-sm ${state.success ? "text-emerald-500" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}