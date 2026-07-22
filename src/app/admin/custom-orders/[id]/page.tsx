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
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-sm font-medium text-foreground">
              Quotation v{q.version}
            </p>
            <span
              className={`text-[11px] font-medium uppercase tracking-wide ${
                q.status === "APPROVED"
                  ? "text-emerald-500"
                  : q.status === "REJECTED"
                    ? "text-status-cancelled"
                    : q.isExpired
                      ? "text-muted-foreground"
                      : "text-amber-500"
              }`}
            >
              {q.isExpired && q.status === "PENDING" ? "EXPIRED" : q.status}
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
    <div>
      <Link
        href="/admin/orders"
        className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Orders
      </Link>

      <div className="mb-4">
        <h1 className="font-heading text-xl font-medium text-foreground">
          Custom order — {request.customerName}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {request.customerEmail} · consultation {formatDate(request.appointmentDate)}
        </p>
      </div>

      {/* Consultation detail */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="font-heading mb-3 text-sm font-medium text-foreground">Consultation</p>
        <DetailRow label="Occasion" value={request.occasionType} />
        <DetailRow label="Occasion date" value={formatDate(request.occasionDate)} />
        <DetailRow label="Appointment slot" value={request.timeSlot} />
        <DetailRow label="Appointment status" value={request.appointmentStatus} />
        {request.stylePreferences && (
          <DetailRow label="Style preferences" value={request.stylePreferences} />
        )}
        {request.appointmentNotes && (
          <DetailRow label="Notes" value={request.appointmentNotes} />
        )}
        {request.referenceImages.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Reference images
            </p>
            <div className="flex flex-wrap gap-2">
              {request.referenceImages.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL
                <img
                  key={url}
                  src={url}
                  alt="Reference"
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote history + form. Once a quote is approved there's nothing
          left to quote, so the form column disappears and history takes
          the full width. */}
      {isApproved ? (
        <div className="mb-4">{historyList}</div>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {historyList}

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-heading mb-3 text-sm font-medium text-foreground">
              {canCreateQuote ? "New quotation" : "Quotation"}
            </p>

            {canCreateQuote ? (
              <QuoteForm
                customDesignRequestId={id}
                defaultValues={
                  history.length > 0
                    ? {
                        fabricAmount: history[0].fabricAmount,
                        laborAmount: history[0].laborAmount,
                        embellishmentAmount: history[0].embellishmentAmount,
                        alterationsAmount: history[0].alterationsAmount,
                        otherAmount: history[0].otherAmount,
                        otherNote: history[0].otherNote,
                        splitType: history[0].splitType,
                      }
                    : undefined
                }
              />
            ) : (
              <p className="text-[13px] text-muted-foreground">
                A quote is pending customer approval — a new version can be created once it&apos;s
                rejected or expires.
              </p>
            )}
          </div>
        </div>
      )}

      {/* First payment */}
      {firstOrder?.success && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">First payment</p>
          <DetailRow label="Amount" value={formatCurrency(firstOrder.data.totalAmount)} />
          <DetailRow label="Method" value={firstOrder.data.paymentMethod} />
          <DetailRow label="Status" value={firstOrder.data.paymentStatus ?? "—"} />

          {firstOrder.data.paymentStatus === "PENDING" && firstOrder.data.paymentMethod === "CASH" && (
            <div className="mt-3 border-t border-border pt-3">
              <ConfirmCashPaymentButton orderId={firstOrder.data.id} customDesignRequestId={id} />
            </div>
          )}
          {firstOrder.data.paymentStatus === "PENDING" &&
            firstOrder.data.paymentMethod === "BANK_TRANSFER" &&
            firstOrder.data.proofImageUrl && (
              <div className="mt-3 border-t border-border pt-3">
                <BankTransferConfirmButton
                  orderId={firstOrder.data.id}
                  customDesignRequestId={id}
                  proofImageUrl={firstOrder.data.proofImageUrl}
                />
              </div>
            )}
        </div>
      )}

      {/* Production tracking — only once a first-payment order exists */}
      {request.firstPaymentOrderId && (
        <div className="mb-4">
          <ProductionTrackingCard
            orderId={request.firstPaymentOrderId}
            customDesignRequestId={id}
          />
        </div>
      )}

      {/* Second payment */}
      {secondOrder?.success ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-heading mb-3 text-sm font-medium text-foreground">
            Second payment (pickup)
          </p>
          <DetailRow label="Amount" value={formatCurrency(secondOrder.data.totalAmount)} />
          <DetailRow label="Method" value={secondOrder.data.paymentMethod} />
          <DetailRow label="Status" value={secondOrder.data.paymentStatus ?? "—"} />

          {secondOrder.data.paymentStatus === "PENDING" && secondOrder.data.paymentMethod === "CASH" && (
            <div className="mt-3 border-t border-border pt-3">
              <ConfirmCashPaymentButton orderId={secondOrder.data.id} customDesignRequestId={id} />
            </div>
          )}
          {secondOrder.data.paymentStatus === "PENDING" &&
            secondOrder.data.paymentMethod === "BANK_TRANSFER" &&
            secondOrder.data.proofImageUrl && (
              <div className="mt-3 border-t border-border pt-3">
                <BankTransferConfirmButton
                  orderId={secondOrder.data.id}
                  customDesignRequestId={id}
                  proofImageUrl={secondOrder.data.proofImageUrl}
                />
              </div>
            )}
        </div>
      ) : (
        firstOrder?.success &&
        firstOrder.data.paymentStatus === "COMPLETED" &&
        latestQuote?.splitType !== "FULL_UPFRONT" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-heading mb-3 text-sm font-medium text-foreground">
              Second payment (pickup)
            </p>
            <ConfirmSecondPaymentForm customDesignRequestId={id} />
          </div>
        )
      )}
    </div>
  );
}