"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { refundOrderAction, type RefundOrderState } from "@/lib/actions/refunds";
import { ImageUploader, type ImageUploaderHandle } from "@/components/products/image-uploader";

const initialState: RefundOrderState = null;

export function RefundOrderButton({ orderId }: { orderId: string }) {
  const actionWithId = refundOrderAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(actionWithId, initialState);

  const uploaderRef = useRef<ImageUploaderHandle>(null);
  const [reason, setReason] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Once a refund succeeds, hide the form -- there is no partial/multiple
  // refund model on the backend (single full refund per order, enforced by
  // uq_refunds_order_id), so re-showing the button after success would just
  // invite a guaranteed 409 on the next click.
  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-completed/40 bg-status-completed/10 p-3 text-xs">
        <p className="font-medium text-status-completed">Refund issued</p>
        <p className="mt-0.5 text-muted-foreground">
          Rs {state.data?.amount.toLocaleString("en-LK")}
          {state.data?.reason ? ` — ${state.data.reason}` : ""}
        </p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploadError(null);

    if (!uploaderRef.current?.hasPending()) {
      setUploadError("Upload proof of the bank transfer first.");
      return;
    }

    // Native confirm() replaced with the styled dialog below — this just
    // opens it, the actual submit happens from the dialog's confirm button.
    setConfirmOpen(true);
  }

  async function doIssueRefund() {
    setConfirmOpen(false);
    setIsUploading(true);
    try {
      const uploaded = await uploaderRef.current!.uploadAll();
      const proofImageUrl = uploaded[0]?.url;

      if (!proofImageUrl) {
        setUploadError("Upload failed — try again.");
        return;
      }

      const formData = new FormData();
      formData.set("reason", reason);
      formData.set("proofImageUrl", proofImageUrl);

      startTransition(() => {
        formAction(formData);
      });
    } catch {
      setUploadError("Upload failed — try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const busy = isPending || isUploading;

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Transfer proof
          </p>
          <ImageUploader ref={uploaderRef} uploadContext="refund-proof" maxImages={1} />
        </div>

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
        />

        {uploadError && <p className="text-xs text-status-cancelled">{uploadError}</p>}
        {state && !state.success && (
          <p className="text-xs text-status-cancelled">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg border border-status-cancelled py-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/10 disabled:opacity-50"
        >
          {isUploading ? "Uploading proof…" : isPending ? "Processing…" : "Issue refund"}
        </button>
      </form>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="issue-refund-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-status-cancelled/15">
                <AlertTriangle className="h-4 w-4 text-status-cancelled" />
              </div>
              <div>
                <p id="issue-refund-title" className="text-sm font-medium text-foreground">
                  Issue a full refund?
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  This marks the payment as refunded and can&apos;t be undone. Make sure the
                  bank transfer has already gone through.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={doIssueRefund}
                className="rounded-lg bg-status-cancelled px-3 py-1.5 text-xs font-medium text-white hover:bg-status-cancelled/90"
              >
                Issue refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}