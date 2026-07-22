import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCustomDesignRequestById } from "@/lib/api/custom-design";
import { getLatestQuote, getQuoteHistory } from "@/lib/api/custom-quotes";
import { getOrderById } from "@/lib/api/orders";
import { ProductionTrackingCard } from "@/components/admin/production-tracking-card";
import { BankTransferConfirmButton } from "@/components/admin/bank-transfer-confirm-button";
import { ConfirmCashPaymentButton } from "@/components/orders/confirm-cash-payment-button";
import { QuoteForm } from "@/components/admin/quote-form";
import { ConfirmSecondPaymentForm } from "@/components/admin/confirm-second-payment-form";
import { formatDate } from "@/lib/utils";
import { PaymentMethodSwitch } from "@/components/admin/payment-method-switch";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default async function AdminCustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const requestResult = await getCustomDesignRequestById(id);
  if (!requestResult.success) notFound();
  const request = requestResult.data;

  const [latestQuoteResult, historyResult] = await Promise.all([
    getLatestQuote(id),
    getQuoteHistory(id),
  ]);

  const latestQuote = latestQuoteResult.success ? latestQuoteResult.data : null;
  const history = historyResult.success ? historyResult.data : [];

  const isApproved = latestQuote?.status === "APPROVED";

  const canCreateQuote =
    !latestQuote ||
    latestQuote.status === "REJECTED" ||
    (latestQuote.status === "PENDING" && latestQuote.isExpired);

  const firstOrder = request.firstPaymentOrderId
    ? await getOrderById(request.firstPaymentOrderId)
    : null;
  const secondOrder = request.secondPaymentOrderId
    ? await getOrderById(request.secondPaymentOrderId)
    : null;

  const historyList = history.length > 0 && (
    <div className="space-y-3">
      {history.map((q) => (
        <div key={q.id} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <p className="font-heading text-sm font-semibold text-foreground">
              Quotation v{q.version}
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                q.status === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : q.status === "REJECTED"
                    ? "bg-status-cancelled/10 text-status-cancelled"
                    : q.isExpired
                      ? "bg-muted text-muted-foreground"
                      : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {q.isExpired && q.status === "PENDING" ? "Expired" : q.status}
            </span>
          </div>

          <DetailRow label="Fabric & materials" value={formatCurrency(q.fabricAmount)} />
          <DetailRow label="Stitching / tailoring labor" value={formatCurrency(q.laborAmount)} />
          <DetailRow label="Embellishments / detailing" value={formatCurrency(q.embellishmentAmount)} />
          <DetailRow label="Alterations & fitting" value={formatCurrency(q.alterationsAmount)} />
          {q.otherAmount > 0 && (
            <DetailRow
              label={q.otherNote ? `Other (${q.otherNote})` : "Other / miscellaneous"}
              value={formatCurrency(q.otherAmount)}
            />
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[13px] font-medium text-foreground">
            <span>Total</span>
            <span>{formatCurrency(q.totalAmount)}</span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {q.splitType === "FULL_UPFRONT" ? "Full upfront" : "50% now, 50% at pickup"}
          </p>

          {q.rejectionReason && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-status-cancelled/10 px-2.5 py-1 text-[11px] font-medium text-status-cancelled">
              <span>Rejected:</span>
              <span className="font-normal">{q.rejectionReason}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
<div className="mx-auto max-w-6xl">
  <Link href="/admin/orders" className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
    <ArrowLeft className="h-3 w-3" /> Orders
  </Link>

  <div className="mb-4 flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {request.customerName.charAt(0).toUpperCase()}
    </div>
    <div>
      <h1 className="font-heading text-lg font-semibold text-foreground">{request.customerName}</h1>
      <p className="text-[12px] text-muted-foreground">
        {request.customerEmail} · consultation {formatDate(request.appointmentDate)}
      </p>
    </div>
  </div>

  {/* Row 1: Consultation + Quotation side by side */}
  <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
    {/* Consultation — compact */}
    <div className="rounded-xl border border-border bg-card p-3.5">
      <p className="font-heading mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Consultation
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <div><span className="text-muted-foreground">Occasion: </span><span className="text-foreground">{request.occasionType}</span></div>
        <div><span className="text-muted-foreground">Date: </span><span className="text-foreground">{formatDate(request.occasionDate)}</span></div>
        <div><span className="text-muted-foreground">Slot: </span><span className="text-foreground">{request.timeSlot}</span></div>
        <div>
          <span className="text-muted-foreground">Status: </span>
          <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-500">
            {request.appointmentStatus}
          </span>
        </div>
      </div>
      {(request.stylePreferences || request.appointmentNotes) && (
        <div className="mt-2 border-t border-border pt-2 text-[13px] text-foreground">
          {request.stylePreferences && <p><span className="text-muted-foreground">Style: </span>{request.stylePreferences}</p>}
          {request.appointmentNotes && <p><span className="text-muted-foreground">Notes: </span>{request.appointmentNotes}</p>}
        </div>
      )}
      {request.referenceImages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border pt-2">
          {request.referenceImages.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL */}
              <img src={url} alt="Reference" className="h-12 w-12 rounded-md border border-border object-cover" />
            </a>
          ))}
        </div>
      )}
    </div>

    {/* Quotation column — history + form/status */}
    <div className="space-y-3">
      {isApproved ? historyList : (
        <>
          {historyList}
          <div className="rounded-xl border border-border bg-card p-3.5">
            <p className="font-heading mb-2 text-[13px] font-medium text-foreground">
              {canCreateQuote ? "New quotation" : "Quotation"}
            </p>
            {canCreateQuote ? (
              <QuoteForm
                customDesignRequestId={id}
                defaultValues={history.length > 0 ? {
                  fabricAmount: history[0].fabricAmount,
                  laborAmount: history[0].laborAmount,
                  embellishmentAmount: history[0].embellishmentAmount,
                  alterationsAmount: history[0].alterationsAmount,
                  otherAmount: history[0].otherAmount,
                  otherNote: history[0].otherNote,
                  splitType: history[0].splitType,
                } : undefined}
              />
            ) : (
              <p className="text-[12px] text-muted-foreground">
                Pending customer approval — a new version can be created once it&apos;s rejected or expires.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  </div>

  {/* Row 2: First payment + Production side by side */}
  <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
    {firstOrder?.success && (
      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="font-heading mb-2 text-[13px] font-medium text-foreground">First payment</p>
        <div className="space-y-1 text-[13px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-foreground">{formatCurrency(firstOrder.data.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">{firstOrder.data.paymentMethod}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-foreground">{firstOrder.data.paymentStatus ?? "—"}</span></div>
        </div>
        {firstOrder.data.paymentStatus === "PENDING" && firstOrder.data.paymentMethod !== "CASH" && (
          <PaymentMethodSwitch orderId={firstOrder.data.id} customDesignRequestId={id} currentMethod={firstOrder.data.paymentMethod} />
        )}
        {firstOrder.data.paymentStatus === "PENDING" && firstOrder.data.paymentMethod === "CASH" && (
          <div className="mt-2 border-t border-border pt-2"><ConfirmCashPaymentButton orderId={firstOrder.data.id} customDesignRequestId={id} /></div>
        )}
        {firstOrder.data.paymentStatus === "PENDING" && firstOrder.data.paymentMethod === "BANK_TRANSFER" && firstOrder.data.proofImageUrl && (
          <div className="mt-2 border-t border-border pt-2">
            <BankTransferConfirmButton orderId={firstOrder.data.id} customDesignRequestId={id} proofImageUrl={firstOrder.data.proofImageUrl} />
          </div>
        )}
      </div>
    )}

    {request.firstPaymentOrderId && (
      <ProductionTrackingCard orderId={request.firstPaymentOrderId} customDesignRequestId={id} />
    )}
  </div>

  {/* Second payment — full width, only when relevant */}
  {secondOrder?.success ? (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <p className="font-heading mb-2 text-[13px] font-medium text-foreground">Second payment (pickup)</p>
      <div className="space-y-1 text-[13px]">
        <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-foreground">{formatCurrency(secondOrder.data.totalAmount)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">{secondOrder.data.paymentMethod}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-foreground">{secondOrder.data.paymentStatus ?? "—"}</span></div>
      </div>
      {secondOrder.data.paymentStatus === "PENDING" && secondOrder.data.paymentMethod === "CASH" && (
        <div className="mt-2 border-t border-border pt-2"><ConfirmCashPaymentButton orderId={secondOrder.data.id} customDesignRequestId={id} /></div>
      )}
      {secondOrder.data.paymentStatus === "PENDING" && secondOrder.data.paymentMethod === "BANK_TRANSFER" && secondOrder.data.proofImageUrl && (
        <div className="mt-2 border-t border-border pt-2">
          <BankTransferConfirmButton orderId={secondOrder.data.id} customDesignRequestId={id} proofImageUrl={secondOrder.data.proofImageUrl} />
        </div>
      )}
    </div>
  ) : (
    firstOrder?.success && firstOrder.data.paymentStatus === "COMPLETED" && latestQuote?.splitType !== "FULL_UPFRONT" && (
      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="font-heading mb-2 text-[13px] font-medium text-foreground">Second payment (pickup)</p>
        <ConfirmSecondPaymentForm customDesignRequestId={id} />
      </div>
    )
  )}
</div>
  );
}