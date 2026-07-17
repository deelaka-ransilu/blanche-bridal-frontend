import { Clock, AlertCircle } from "lucide-react";
import { getPaymentStatusAction } from "@/lib/actions/payments";

export async function PaymentStatusPanel({ orderId }: { orderId: string }) {
  const result = await getPaymentStatusAction(orderId);

  if (!result.success) {
    return (
      <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>Couldn&apos;t load payment status: {result.message}</p>
      </div>
    );
  }

  const status = result.data.status;

  if (status === "COMPLETED") {
    // Shouldn't normally happen while order.status is still PENDING (the
    // webhook flips both together), but shown defensively in case of a
    // partial failure between payment confirm and order status update.
    return (
      <p className="text-[13px] text-status-completed">
        Payment received — order status will update shortly.
      </p>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex items-start gap-2 text-[13px] text-status-cancelled">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>Payment failed or was cancelled by the customer via PayHere.</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 text-[13px] text-status-pending">
      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        Awaiting PayHere payment — this order will confirm automatically once
        the customer completes checkout. No action needed here.
      </p>
    </div>
  );
}