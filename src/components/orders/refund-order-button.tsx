"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { refundOrderAction, type RefundOrderState } from "@/lib/actions/refunds";
import { ImageUploader, type ImageUploaderHandle } from "@/components/products/image-uploader";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

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
        <ConfirmDialog
          icon={AlertTriangle}
          iconWrapClass="bg-status-cancelled/15"
          iconClass="text-status-cancelled"
          confirmButtonClass="bg-status-cancelled hover:bg-status-cancelled/90"
          title="Issue a full refund?"
          description="This marks the payment as refunded and can't be undone. Make sure the bank transfer has already gone through."
          confirmLabel="Issue refund"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={doIssueRefund}
        />
      )}
    </>
  );
}