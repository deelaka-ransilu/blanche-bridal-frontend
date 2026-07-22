import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCustomDesignRequestById } from "@/lib/api/custom-design";
import { getLatestQuote } from "@/lib/api/custom-quotes";
import { RespondQuoteForm } from "@/components/custom-design/respond-quote-form";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-LK")}`;
}

export default async function MyCustomDesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [requestResult, quoteResult] = await Promise.all([
    getCustomDesignRequestById(id),
    getLatestQuote(id),
  ]);

  if (!requestResult.success) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-sm text-destructive">{requestResult.message}</p>
      </div>
    );
  }

  const request = requestResult.data;
  const quote = quoteResult.success ? quoteResult.data : null;
  const noQuoteYet = !quoteResult.success && quoteResult.message === "NOT_FOUND";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-40 sm:pb-10">
      <Link
        href="/my/dashboard"
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium text-foreground">
          Custom Design Consultation
        </h1>
        <p className="text-sm text-muted-foreground">
          Occasion: {request.occasionType} · {request.occasionDate}
        </p>
      </div>

      {noQuoteYet && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            We haven&apos;t sent a quote for this request yet — we&apos;ll email you
            as soon as it&apos;s ready.
          </p>
        </div>
      )}

      {!noQuoteYet && !quoteResult.success && (
        <p className="text-sm text-destructive">{quoteResult.message}</p>
      )}

      {quote && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">
            Quote (version {quote.version})
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Fabric & materials</span>
              <span>{formatCurrency(quote.fabricAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Stitching / tailoring labor</span>
              <span>{formatCurrency(quote.laborAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Embellishments / detailing</span>
              <span>{formatCurrency(quote.embellishmentAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Alterations & fitting</span>
              <span>{formatCurrency(quote.alterationsAmount)}</span>
            </div>
            {quote.otherAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Other{quote.otherNote ? ` (${quote.otherNote})` : ""}</span>
                <span>{formatCurrency(quote.otherAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
              <span>Total</span>
              <span>{formatCurrency(quote.totalAmount)}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Payment: {quote.splitType === "FULL_UPFRONT" ? "Full amount upfront" : "50% now, 50% at pickup"}
          </p>

          {quote.isExpired && quote.status === "PENDING" && (
            <p className="text-sm text-destructive">
              This quote has expired. Please contact us for a new one.
            </p>
          )}

          {quote.status === "PENDING" && !quote.isExpired && (
            <RespondQuoteForm quoteId={quote.id} customDesignRequestId={id} />
          )}

          {quote.status === "APPROVED" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Quote approved</p>
                  <p className="text-xs text-muted-foreground">
                    First payment due now
                  </p>
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(quote.totalAmount * 0.5)}
                </span>
              </div>
              {request.firstPaymentOrderId ? (
                <Link
                  href={`/my/orders/${request.firstPaymentOrderId}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Pay now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We&apos;ll be in touch shortly about your first payment.
                </p>
              )}
            </div>
          )}

          {quote.status === "REJECTED" && (
            <p className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
              You rejected this quote{quote.rejectionReason ? `: "${quote.rejectionReason}"` : ""}.
              We&apos;re preparing a revised version.
            </p>
          )}
        </div>
      )}
    </div>
  );
}