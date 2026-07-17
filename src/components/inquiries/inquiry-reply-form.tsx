"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { sendInquiryReplyAction } from "@/lib/actions/inquiries";
import { Button } from "@/components/ui/button";

export function InquiryReplyForm({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  const [state, formAction, pending] = useActionState(
    sendInquiryReplyAction.bind(null, id),
    null,
  );

  return (
    <form action={formAction} className="space-y-2.5">
      <div>
        <textarea
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your reply..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-right text-[11px] text-muted-foreground/70">
          {message.length} characters
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="submit" size="sm" disabled={pending || !message.trim()}>
          {pending ? "Sending…" : "Send Reply"}
        </Button>

        {state && (
          <p
            className={`flex items-center gap-1.5 text-xs ${
              state.success ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {state.success ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}